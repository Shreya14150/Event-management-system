import qrcode
import io
import base64

def generate_qr_base64(data):
    """
    Generate QR code and return it as base64-encoded data URI.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Save to memory
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")

    # Encode as base64
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Return as a full data URI
    return f"data:image/png;base64,{qr_base64}"
