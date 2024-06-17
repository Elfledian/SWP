package click.badcourt.be.service;

import click.badcourt.be.model.request.QRCodeData;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;


@Service
public class QRCodeService {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void generateQRCode(QRCodeData data, String filePath) {
        int width = 300;
        int height = 300;
        String format = "png";

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);

        try {
            // Convert data to JSON string
            String jsonData = objectMapper.writeValueAsString(data);

            // Generate QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(jsonData, BarcodeFormat.QR_CODE, width, height, hints);

            // Define output file path
            Path path = FileSystems.getDefault().getPath(filePath);
            MatrixToImageWriter.writeToPath(bitMatrix, format, path);

            System.out.println("QR code generated successfully!");
        } catch (WriterException e) {
            System.out.println("Error generating QR code: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Error writing QR code to file: " + e.getMessage());
        }
    }

    public QRCodeData decodeQr(byte[] data) throws IOException, NotFoundException{
        Result result = new MultiFormatReader()
                .decode(new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(
                        ImageIO.read(new ByteArrayInputStream(data))))));
        return result != null ? objectMapper.readValue(result.getText(), QRCodeData.class) : null;
    }

}