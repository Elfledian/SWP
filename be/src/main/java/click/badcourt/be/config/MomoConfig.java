package click.badcourt.be.config;

import com.google.api.client.util.Value;
import lombok.Getter;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class MomoConfig {

    private String partnerCode="MOMO";

    private String accessKey="F8BBA842ECF85";

    private String secretKey="K951B6PE1waDMi640xX08PD3vg6EkVlz";

    @Value("${momo.public.key}")
    private String publicKey;

    private String apiUrl="https://test-payment.momo.vn";

    private String returnUrl="http://badcourts.click";


    private String notifyUrl="http://badcourts.click";

}