# app.py - Backend quản lý bài viết (Flask + MongoDB)
import os
import math
import re
import random
import smtplib
import datetime
import unicodedata
from email.mime.text import MIMEText
from email.header import Header
from functools import wraps

import jwt
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()  # đọc file .env

app = Flask(__name__)
CORS(app)

KHOA_BI_MAT = os.getenv("JWT_SECRET", "doi-khoa-nay-di")
SO_BAI_MOI_TRANG = 6


# =====================================================
# 1. KẾT NỐI MONGODB
#    MongoDB lưu dữ liệu dạng "document" (giống dictionary).
#    - collection nguoi_dung : người dùng
#    - collection bai_viet   : bài viết
#    - collection ma_otp     : mã OTP quên mật khẩu
#    Database và collection tự được tạo khi có dữ liệu đầu tiên.
# =====================================================
may_khach = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"), serverSelectionTimeoutMS=5000)
db = may_khach[os.getenv("DB_NAME", "quan_ly_bai_viet")]

nguoi_dung_col = db["nguoi_dung"]
bai_viet_col = db["bai_viet"]
ma_otp_col = db["ma_otp"]

try:
    nguoi_dung_col.create_index("email", unique=True)           # không cho trùng email
    ma_otp_col.create_index("het_han", expireAfterSeconds=0)    # MongoDB tự xoá OTP khi hết hạn
except Exception as e:
    print("Không kết nối được MongoDB, hãy kiểm tra MONGO_URI và xem MongoDB đã chạy chưa:", e)


# =====================================================
# 2. HÀM TIỆN ÍCH
# =====================================================
def bay_gio():
    """Giờ hiện tại theo UTC (MongoDB lưu thời gian theo UTC)"""
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


def loi(thong_diep, ma=400):
    return jsonify({"loi": thong_diep}), ma


def lay_object_id(chuoi):
    """Đổi chuỗi sang ObjectId, nếu chuỗi sai định dạng thì trả về None"""
    if ObjectId.is_valid(chuoi):
        return ObjectId(chuoi)
    return None


def chuyen_doi(tai_lieu):
    """Đổi document của MongoDB sang dạng gửi được cho frontend:
    _id (ObjectId) -> id (chuỗi), nguoi_dung_id cũng đổi sang chuỗi"""
    tai_lieu["id"] = str(tai_lieu.pop("_id"))
    if "nguoi_dung_id" in tai_lieu:
        tai_lieu["nguoi_dung_id"] = str(tai_lieu["nguoi_dung_id"])
    return tai_lieu


def tao_token(nguoi_dung_id):
    han = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    return jwt.encode({"id": str(nguoi_dung_id), "exp": han}, KHOA_BI_MAT, algorithm="HS256")


def lay_nguoi_dung_hien_tai():
    """Đọc token trong header, trả về người dùng (hoặc None nếu chưa đăng nhập)"""
    tieu_de = request.headers.get("Authorization", "")
    if not tieu_de.startswith("Bearer "):
        return None
    try:
        du_lieu = jwt.decode(tieu_de[7:], KHOA_BI_MAT, algorithms=["HS256"])
    except Exception:
        return None

    nguoi_dung_id = lay_object_id(du_lieu.get("id"))
    if nguoi_dung_id is None:
        return None
    nguoi_dung = nguoi_dung_col.find_one({"_id": nguoi_dung_id}, {"mat_khau": 0})  # 0 = không lấy mật khẩu
    if nguoi_dung is None:
        return None
    return chuyen_doi(nguoi_dung)


def can_dang_nhap(ham):
    """Đặt @can_dang_nhap phía trên các API bắt buộc đăng nhập"""
    @wraps(ham)
    def ham_boc(*args, **kwargs):
        nguoi_dung = lay_nguoi_dung_hien_tai()
        if nguoi_dung is None:
            return loi("Bạn cần đăng nhập để thực hiện chức năng này", 401)
        g.nguoi_dung = nguoi_dung
        return ham(*args, **kwargs)
    return ham_boc


def gui_email_otp(email_nhan, ma_otp):
    """Gửi mã OTP qua Gmail thật bằng SMTP"""
    email_gui = os.getenv("EMAIL_GUI")
    mat_khau_ung_dung = os.getenv("EMAIL_MAT_KHAU_UNG_DUNG")

    noi_dung = (
        "<div style='font-family:Arial,sans-serif;font-size:15px'>"
        "<p>Bạn vừa yêu cầu đặt lại mật khẩu trên <b>MựcXanh</b>.</p>"
        "<p>Mã OTP của bạn là:</p>"
        "<p style='font-size:32px;letter-spacing:8px;font-weight:bold;color:#0B7A75'>" + ma_otp + "</p>"
        "<p>Mã có hiệu lực trong 5 phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>"
        "</div>"
    )
    thu = MIMEText(noi_dung, "html", "utf-8")
    thu["Subject"] = Header("Mã OTP đặt lại mật khẩu - MựcXanh", "utf-8")
    thu["From"] = email_gui
    thu["To"] = email_nhan

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as may_chu:
        may_chu.login(email_gui, mat_khau_ung_dung)
        may_chu.sendmail(email_gui, [email_nhan], thu.as_string())


def bo_dau_tieng_viet(chuoi):
    """Chuẩn hoá câu hỏi để nhận biết ý định bằng từ khoá đơn giản."""
    chuoi = unicodedata.normalize("NFD", chuoi.lower())
    chuoi = "".join(ky_tu for ky_tu in chuoi if unicodedata.category(ky_tu) != "Mn")
    return chuoi.replace("đ", "d")


def thong_ke_bai_viet(nguoi_dung):
    """Tổng hợp bài đã đăng công khai và bản nháp của chính người đang đăng nhập."""
    bo_loc = {"trang_thai": "dang"}
    if nguoi_dung:
        bo_loc = {"$or": [
            {"trang_thai": "dang"},
            {"trang_thai": "nhap", "nguoi_dung_id": ObjectId(nguoi_dung["id"])},
        ]}

    cac_bai = list(bai_viet_col.find(bo_loc, {
        "tieu_de": 1, "the_loai": 1, "luot_xem": 1, "trang_thai": 1,
    }))
    bai_cong_khai = [bai for bai in cac_bai if bai.get("trang_thai") == "dang"]
    theo_the_loai = {}
    for bai in bai_cong_khai:
        ten = bai.get("the_loai") or "Khác"
        theo_the_loai[ten] = theo_the_loai.get(ten, 0) + 1

    noi_bat = sorted(bai_cong_khai, key=lambda bai: bai.get("luot_xem", 0), reverse=True)[:3]
    return {
        "tong_bai_dang": len(bai_cong_khai),
        "tong_ban_nhap": len(cac_bai) - len(bai_cong_khai),
        "tong_luot_xem": sum(bai.get("luot_xem", 0) for bai in bai_cong_khai),
        "theo_the_loai": theo_the_loai,
        "bai_noi_bat": [{
            "id": str(bai["_id"]),
            "tieu_de": bai.get("tieu_de", ""),
            "luot_xem": bai.get("luot_xem", 0),
        } for bai in noi_bat],
    }


# =====================================================
# 3. XÁC THỰC: đăng ký, đăng nhập, quên mật khẩu
# =====================================================
@app.route("/api/dang-ky", methods=["POST"])
def dang_ky():
    du_lieu = request.get_json() or {}
    ten = (du_lieu.get("ten") or "").strip()
    email = (du_lieu.get("email") or "").strip().lower()
    mat_khau = du_lieu.get("mat_khau") or ""

    if ten == "" or email == "" or mat_khau == "":
        return loi("Vui lòng nhập đầy đủ thông tin")
    if "@" not in email:
        return loi("Email không hợp lệ")
    if len(mat_khau) < 6:
        return loi("Mật khẩu phải có ít nhất 6 ký tự")
    if nguoi_dung_col.find_one({"email": email}) is not None:
        return loi("Email này đã được đăng ký", 409)

    try:
        nguoi_dung_col.insert_one({
            "ten": ten,
            "email": email,
            "mat_khau": generate_password_hash(mat_khau),  # lưu mật khẩu đã băm
            "ngay_tao": bay_gio(),
        })
    except DuplicateKeyError:
        return loi("Email này đã được đăng ký", 409)
    return jsonify({"thong_diep": "Đăng ký thành công"}), 201


@app.route("/api/dang-nhap", methods=["POST"])
def dang_nhap():
    du_lieu = request.get_json() or {}
    email = (du_lieu.get("email") or "").strip().lower()
    mat_khau = du_lieu.get("mat_khau") or ""

    nguoi_dung = nguoi_dung_col.find_one({"email": email})
    if nguoi_dung is None or not check_password_hash(nguoi_dung["mat_khau"], mat_khau):
        return loi("Email hoặc mật khẩu không đúng", 401)

    return jsonify({
        "token": tao_token(nguoi_dung["_id"]),
        "nguoi_dung": {"id": str(nguoi_dung["_id"]), "ten": nguoi_dung["ten"], "email": nguoi_dung["email"]},
    })


@app.route("/api/toi", methods=["GET"])
@can_dang_nhap
def thong_tin_cua_toi():
    return jsonify({"nguoi_dung": g.nguoi_dung})


@app.route("/api/trang-ca-nhan", methods=["GET"])
@can_dang_nhap
def lay_trang_ca_nhan():
    return jsonify({
        "ten": g.nguoi_dung.get("ten", ""),
        "tuoi": g.nguoi_dung.get("tuoi", ""),
        "so_thich": g.nguoi_dung.get("so_thich", ""),
        "chuc_vu": g.nguoi_dung.get("chuc_vu", ""),
        "truong_hoc_cong_ty": g.nguoi_dung.get("truong_hoc_cong_ty", ""),
        "anh_dai_dien": g.nguoi_dung.get("anh_dai_dien", ""),
    })


@app.route("/api/trang-ca-nhan", methods=["PUT"])
@can_dang_nhap
def cap_nhat_trang_ca_nhan():
    du_lieu = request.get_json() or {}
    cap_nhat = {}
    ten_cu = g.nguoi_dung.get("ten", "")

    if "ten" in du_lieu:
        ten = str(du_lieu.get("ten") or "").strip()
        if len(ten) > 80:
            return loi("Tên không được dài quá 80 ký tự")
        cap_nhat["ten"] = ten

    if "tuoi" in du_lieu:
        tuoi = du_lieu.get("tuoi")
        if tuoi in (None, ""):
            cap_nhat["tuoi"] = ""
        else:
            try:
                tuoi = int(tuoi)
            except (TypeError, ValueError):
                return loi("Tuổi phải là số nguyên")
            if tuoi < 1 or tuoi > 120:
                return loi("Tuổi phải nằm trong khoảng 1 đến 120")
            cap_nhat["tuoi"] = tuoi

    cac_truong = ("so_thich", "chuc_vu", "truong_hoc_cong_ty")
    for truong in cac_truong:
        if truong in du_lieu:
            gia_tri = str(du_lieu.get(truong) or "").strip()
            if len(gia_tri) > 300:
                return loi("Mỗi thông tin chỉ được dài tối đa 300 ký tự")
            cap_nhat[truong] = gia_tri

    if "anh_dai_dien" in du_lieu:
        anh = str(du_lieu.get("anh_dai_dien") or "")
        if anh and not re.match(r"^data:image/(png|jpeg|webp);base64,", anh):
            return loi("Ảnh đại diện phải là PNG, JPG hoặc WebP")
        if len(anh) > 1400000:
            return loi("Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn 1 MB")
        cap_nhat["anh_dai_dien"] = anh

    if cap_nhat:
        nguoi_dung_col.update_one(
            {"_id": ObjectId(g.nguoi_dung["id"])},
            {"$set": cap_nhat},
        )
        ten_moi = cap_nhat.get("ten", ten_cu)
        if ten_moi != ten_cu:
            bai_viet_col.update_many(
                {"nguoi_dung_id": ObjectId(g.nguoi_dung["id"])},
                {"$set": {"tac_gia": ten_moi or "Ẩn danh"}},
            )
    return jsonify({"thong_diep": "Đã cập nhật trang cá nhân"})


@app.route("/api/trang-ca-nhan", methods=["DELETE"])
@can_dang_nhap
def xoa_thong_tin_trang_ca_nhan():
    nguoi_dung_id = ObjectId(g.nguoi_dung["id"])
    nguoi_dung_col.update_one(
        {"_id": nguoi_dung_id},
        {"$set": {"ten": ""}, "$unset": {
            "tuoi": "", "so_thich": "", "chuc_vu": "", "truong_hoc_cong_ty": "", "anh_dai_dien": "",
        }},
    )
    bai_viet_col.update_many(
        {"nguoi_dung_id": nguoi_dung_id},
        {"$set": {"tac_gia": "Ẩn danh"}},
    )
    return jsonify({"thong_diep": "Đã xóa thông tin trang cá nhân"})


@app.route("/api/quen-mat-khau", methods=["POST"])
def quen_mat_khau():
    """Bước 1: nhập email -> gửi mã OTP 6 số về email"""
    du_lieu = request.get_json() or {}
    email = (du_lieu.get("email") or "").strip().lower()
    if email == "":
        return loi("Vui lòng nhập email")

    nguoi_dung = nguoi_dung_col.find_one({"email": email})
    if nguoi_dung is not None:
        ma_otp = str(random.SystemRandom().randint(100000, 999999))

        ma_otp_col.delete_many({"email": email})  # xoá mã cũ (nếu có)
        ma_otp_col.insert_one({
            "email": email,
            "ma_bam": generate_password_hash(ma_otp),
            "het_han": bay_gio() + datetime.timedelta(minutes=5),
            "so_lan_sai": 0,
        })
        try:
            gui_email_otp(email, ma_otp)
        except Exception as e:
            print("Lỗi gửi email:", e)
            return loi("Không gửi được email. Hãy kiểm tra EMAIL_GUI trong file .env", 500)

    # Luôn trả về cùng một câu để người lạ không dò được email nào đã đăng ký
    return jsonify({"thong_diep": "Nếu email đã đăng ký, mã OTP đã được gửi. Hãy kiểm tra hộp thư."})


@app.route("/api/dat-lai-mat-khau", methods=["POST"])
def dat_lai_mat_khau():
    """Bước 2: nhập OTP + mật khẩu mới"""
    du_lieu = request.get_json() or {}
    email = (du_lieu.get("email") or "").strip().lower()
    ma_otp = (du_lieu.get("ma_otp") or "").strip()
    mat_khau_moi = du_lieu.get("mat_khau_moi") or ""

    if len(mat_khau_moi) < 6:
        return loi("Mật khẩu mới phải có ít nhất 6 ký tự")

    ban_ghi = ma_otp_col.find_one({"email": email})
    if ban_ghi is None:
        return loi("Mã OTP không hợp lệ hoặc đã hết hạn, hãy yêu cầu mã mới")
    if ban_ghi["het_han"] < bay_gio():
        ma_otp_col.delete_one({"_id": ban_ghi["_id"]})
        return loi("Mã OTP đã hết hạn, hãy yêu cầu mã mới")
    if ban_ghi["so_lan_sai"] >= 5:
        ma_otp_col.delete_one({"_id": ban_ghi["_id"]})
        return loi("Bạn nhập sai quá nhiều lần, hãy yêu cầu mã mới")
    if not check_password_hash(ban_ghi["ma_bam"], ma_otp):
        ma_otp_col.update_one({"_id": ban_ghi["_id"]}, {"$inc": {"so_lan_sai": 1}})  # tăng số lần sai thêm 1
        return loi("Mã OTP không đúng")

    nguoi_dung_col.update_one({"email": email}, {"$set": {"mat_khau": generate_password_hash(mat_khau_moi)}})
    ma_otp_col.delete_one({"_id": ban_ghi["_id"]})
    return jsonify({"thong_diep": "Đặt lại mật khẩu thành công"})


# =====================================================
# 4. BÀI VIẾT: xem, tìm kiếm, thêm, sửa, xoá
# =====================================================
def kiem_tra_bai_viet(du_lieu):
    """Trả về (bài viết đã làm sạch, thông báo lỗi)"""
    tieu_de = (du_lieu.get("tieu_de") or "").strip()
    noi_dung = (du_lieu.get("noi_dung") or "").strip()
    if tieu_de == "" or noi_dung == "":
        return None, "Tiêu đề và nội dung không được để trống"

    trang_thai = du_lieu.get("trang_thai")
    if trang_thai != "nhap":
        trang_thai = "dang"

    bai = {
        "tieu_de": tieu_de,
        "tom_tat": (du_lieu.get("tom_tat") or "").strip(),
        "noi_dung": noi_dung,
        "anh_bia": (du_lieu.get("anh_bia") or "").strip(),
        "the_loai": (du_lieu.get("the_loai") or "Khác").strip(),
        "trang_thai": trang_thai,
    }
    return bai, None


@app.route("/api/bai-viet", methods=["GET"])
def danh_sach_bai_viet():
    """Trang chủ: chỉ hiện bài đã đăng, có tìm kiếm + lọc thể loại + phân trang"""
    tu_khoa = request.args.get("tu_khoa", "").strip()
    the_loai = request.args.get("the_loai", "").strip()
    try:
        trang = max(1, int(request.args.get("trang", 1)))
    except ValueError:
        trang = 1

    # Bộ lọc kiểu MongoDB: giống mệnh đề WHERE trong SQL
    bo_loc = {"trang_thai": "dang"}
    if tu_khoa != "":
        mau_tim = {"$regex": re.escape(tu_khoa), "$options": "i"}  # "i" = không phân biệt hoa thường
        bo_loc["$or"] = [{"tieu_de": mau_tim}, {"tom_tat": mau_tim}]
    if the_loai != "":
        bo_loc["the_loai"] = the_loai

    tong_bai = bai_viet_col.count_documents(bo_loc)
    vi_tri = (trang - 1) * SO_BAI_MOI_TRANG

    con_tro = (
        bai_viet_col.find(bo_loc, {"noi_dung": 0})  # danh sách không cần lấy nội dung dài
        .sort("ngay_tao", -1)                       # -1 = mới nhất trước
        .skip(vi_tri)
        .limit(SO_BAI_MOI_TRANG)
    )
    danh_sach = []
    for bai in con_tro:
        danh_sach.append(chuyen_doi(bai))

    return jsonify({
        "danh_sach": danh_sach,
        "tong_trang": max(1, math.ceil(tong_bai / SO_BAI_MOI_TRANG)),
    })


@app.route("/api/tro-ly", methods=["POST"])
def tro_ly_bai_viet():
    """Trợ lý từ khoá: tìm bài viết hoặc tổng hợp số liệu mà không gọi dịch vụ AI ngoài."""
    du_lieu = request.get_json() or {}
    cau_hoi = (du_lieu.get("tin_nhan") or "").strip()[:200]
    if not cau_hoi:
        return loi("Bạn hãy nhập câu hỏi cho trợ lý")

    cau_chuan = bo_dau_tieng_viet(cau_hoi)
    tu_thong_ke = ("thong ke", "tong hop", "bao cao", "so lieu", "co bao nhieu", "noi bat")
    if any(tu in cau_chuan for tu in tu_thong_ke):
        nguoi_dung = lay_nguoi_dung_hien_tai()
        return jsonify({"loai": "thong_ke", "du_lieu": thong_ke_bai_viet(nguoi_dung)})

    cau_chuan = bo_dau_tieng_viet(cau_hoi)
    mau_cau_lenh = r"^(?:cho toi |hay |giup toi )?(?:tim kiem bai viet(?: ve )?|tim bai viet(?: ve )?|tim kiem |tim |search )"
    cau_sau_lenh = re.sub(mau_cau_lenh, "", cau_chuan, flags=re.IGNORECASE)
    do_dai_lenh = len(cau_chuan) - len(cau_sau_lenh)
    tu_tim = cau_hoi[do_dai_lenh:].strip(" ?!.,:;")
    if not tu_tim:
        return jsonify({"loai": "goi_y", "thong_diep": "Bạn muốn tìm bài viết theo tiêu đề hay chủ đề nào?"})

    mau_tim = {"$regex": re.escape(tu_tim), "$options": "i"}
    cac_bai = list(bai_viet_col.find({
        "trang_thai": "dang",
        "$or": [{"tieu_de": mau_tim}, {"tom_tat": mau_tim}, {"noi_dung": mau_tim}],
    }, {"noi_dung": 0}).sort("ngay_tao", -1).limit(5))

    ket_qua = []
    for bai in cac_bai:
        ket_qua.append({
            "id": str(bai["_id"]),
            "tieu_de": bai.get("tieu_de", ""),
            "tom_tat": bai.get("tom_tat", ""),
            "the_loai": bai.get("the_loai", "Khác"),
            "tac_gia": bai.get("tac_gia", ""),
            "luot_xem": bai.get("luot_xem", 0),
        })
    return jsonify({"loai": "tim_kiem", "tu_khoa": tu_tim, "danh_sach": ket_qua})


@app.route("/api/bai-viet/<bai_id>", methods=["GET"])
def chi_tiet_bai_viet(bai_id):
    oid = lay_object_id(bai_id)
    bai = bai_viet_col.find_one({"_id": oid}) if oid else None
    if bai is None:
        return loi("Không tìm thấy bài viết", 404)

    nguoi_dung = lay_nguoi_dung_hien_tai()
    la_chu_bai = nguoi_dung is not None and nguoi_dung["id"] == str(bai["nguoi_dung_id"])

    # Bản nháp thì chỉ tác giả được xem
    if bai["trang_thai"] != "dang" and not la_chu_bai:
        return loi("Không tìm thấy bài viết", 404)

    # Tác giả tự xem bài của mình thì không tính lượt xem
    if not la_chu_bai:
        bai_viet_col.update_one({"_id": oid}, {"$inc": {"luot_xem": 1}})
        bai["luot_xem"] = bai["luot_xem"] + 1

    bai = chuyen_doi(bai)
    bai["la_chu_bai"] = la_chu_bai
    return jsonify(bai)


@app.route("/api/bai-viet-cua-toi", methods=["GET"])
@can_dang_nhap
def bai_viet_cua_toi():
    con_tro = (
        bai_viet_col.find({"nguoi_dung_id": ObjectId(g.nguoi_dung["id"])}, {"noi_dung": 0})
        .sort("ngay_tao", -1)
    )
    danh_sach = []
    for bai in con_tro:
        danh_sach.append(chuyen_doi(bai))
    return jsonify({"danh_sach": danh_sach})


@app.route("/api/bai-viet", methods=["POST"])
@can_dang_nhap
def them_bai_viet():
    bai, thong_bao_loi = kiem_tra_bai_viet(request.get_json() or {})
    if thong_bao_loi:
        return loi(thong_bao_loi)

    bai["nguoi_dung_id"] = ObjectId(g.nguoi_dung["id"])
    bai["tac_gia"] = g.nguoi_dung.get("ten") or "Ẩn danh"  # lưu tên tác giả tại thời điểm đăng
    bai["luot_xem"] = 0
    bai["ngay_tao"] = bay_gio()

    ket_qua = bai_viet_col.insert_one(bai)
    return jsonify({"id": str(ket_qua.inserted_id), "thong_diep": "Đã lưu bài viết"}), 201


@app.route("/api/bai-viet/<bai_id>", methods=["PUT"])
@can_dang_nhap
def sua_bai_viet(bai_id):
    oid = lay_object_id(bai_id)
    bai_cu = bai_viet_col.find_one({"_id": oid}) if oid else None
    if bai_cu is None:
        return loi("Không tìm thấy bài viết", 404)
    if str(bai_cu["nguoi_dung_id"]) != g.nguoi_dung["id"]:
        return loi("Bạn không có quyền sửa bài viết này", 403)

    bai, thong_bao_loi = kiem_tra_bai_viet(request.get_json() or {})
    if thong_bao_loi:
        return loi(thong_bao_loi)

    bai["ngay_sua"] = bay_gio()
    bai_viet_col.update_one({"_id": oid}, {"$set": bai})
    return jsonify({"id": bai_id, "thong_diep": "Đã cập nhật bài viết"})


@app.route("/api/bai-viet/<bai_id>", methods=["DELETE"])
@can_dang_nhap
def xoa_bai_viet(bai_id):
    oid = lay_object_id(bai_id)
    bai_cu = bai_viet_col.find_one({"_id": oid}) if oid else None
    if bai_cu is None:
        return loi("Không tìm thấy bài viết", 404)
    if str(bai_cu["nguoi_dung_id"]) != g.nguoi_dung["id"]:
        return loi("Bạn không có quyền xoá bài viết này", 403)

    bai_viet_col.delete_one({"_id": oid})
    return jsonify({"thong_diep": "Đã xoá bài viết"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
