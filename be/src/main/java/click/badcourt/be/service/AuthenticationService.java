package click.badcourt.be.service;

import click.badcourt.be.entity.Account;
import click.badcourt.be.entity.Club;
import click.badcourt.be.entity.EmailDetail;
import click.badcourt.be.enums.RoleEnum;
import click.badcourt.be.exception.BadRequestException;
import click.badcourt.be.model.request.*;
import click.badcourt.be.model.response.AccountManageResponse;
import click.badcourt.be.model.response.AccountManageResponseProfile;
import click.badcourt.be.model.response.AccountResponse;
import click.badcourt.be.model.response.AccountUpdateResponse;
import click.badcourt.be.repository.AuthenticationRepository;
import click.badcourt.be.repository.ClubRepository;
import click.badcourt.be.utils.AccountUtils;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class AuthenticationService implements UserDetailsService {

    @Autowired
    AuthenticationRepository authenticationRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    EmailService emailService;

    @Autowired
    TokenService tokenService;

    @Autowired
    private AccountUtils accountUtils;

    @Autowired
    private AuthenticationManager authenticationManager;
    private static final Map<String, OtpStore> otpStore = new HashMap<>();
    private static final int OTP_EXPIRATION_MINUTES = 5;
    @Autowired
    private ClubRepository clubRepository;
    private static final String CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final SecureRandom random = new SecureRandom();

    public static String generateOTP(int length) {
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return otp.toString();
    }

    // Validate email format
    public static boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }

    // Validate phone number format (basic example, adjust regex for specific requirements)
    public static boolean isValidPhone(String phone) {
        String phoneRegex = "^\\+?[0-9. ()-]{7,25}$";
        Pattern pattern = Pattern.compile(phoneRegex);
        return pattern.matcher(phone).matches();
    }

    // Hash OTP using BCrypt
    public static String hashOtp(String otp) {
        return BCrypt.hashpw(otp, BCrypt.gensalt());
    }

    // Save OTP hash with expiration
    public static void saveOtpHash(String email, String otpHash) {
        otpStore.put(email, new OtpStore(otpHash, LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES)));
    }

    // Validate OTP
    public static boolean isOtpValid(String email, String otp) {
        OtpStore otpData = otpStore.get(email);
        if (otpData != null && LocalDateTime.now().isBefore(otpData.expiration)) {
            return BCrypt.checkpw(otp, otpData.otpHash);
        }
        return false;
    }

    public AccountUpdateResponse updateNameAndPhone(AccountUpdateRequest accountUpdateRequest) {
        Account account = accountUtils.getCurrentAccount();
        account.setFullName(accountUpdateRequest.getFullName());
        account.setPhone(accountUpdateRequest.getPhone());
        authenticationRepository.save(account);
        AccountUpdateResponse accountUpdateResponse = new AccountUpdateResponse();
        accountUpdateResponse.setFullName(accountUtils.getCurrentAccount().getFullName());
        accountUpdateResponse.setPhone(accountUtils.getCurrentAccount().getPhone());
        return accountUpdateResponse;
    }


    // Store OTP and its expiration time
    private static class OtpStore {
        String otpHash;
        LocalDateTime expiration;

        OtpStore(String otpHash, LocalDateTime expiration) {
            this.otpHash = otpHash;
            this.expiration = expiration;
        }
    }


    public Account register(RegisterRequest reg) {
        Account account = new Account();
        account.setPhone(reg.getPhone());
        account.setPassword(passwordEncoder.encode(reg.getPassword()));
        account.setRole(RoleEnum.CUSTOMER);
        account.setEmail(reg.getEmail());
        account.setFullName(reg.getFullName());

//        EmailDetail emailDetail = new EmailDetail();
//        emailDetail.setRecipient(account.getEmail());
//        emailDetail.setSubject("You are invited to system!");
//        emailDetail.setMsgBody("aaa");

        return authenticationRepository.save(account);
    }

    public Account registerClubOwner(RegisterClubOwnerRequest reg) {
        Account account = new Account();
        account.setPhone(reg.getPhone());
        account.setPassword(null);
        account.setRole(RoleEnum.CLUB_OWNER);
        account.setEmail(reg.getEmail());
        account.setFullName(reg.getFullName());
        return authenticationRepository.save(account);
    }

    public Account registerAdmin(RegisterRequest reg) {
        Account account = new Account();
        account.setPhone(reg.getPhone());
        account.setPassword(passwordEncoder.encode(reg.getPassword()));
        account.setRole(RoleEnum.ADMIN);
        account.setEmail(reg.getEmail());
        account.setFullName(reg.getFullName());
        return authenticationRepository.save(account);
    }

    public Account registerStaff(RegisterRequest reg) {
        Account account = new Account();
        account.setPhone(reg.getPhone());
        account.setPassword(passwordEncoder.encode(reg.getPassword()));
        account.setRole(RoleEnum.STAFF);
        account.setEmail(reg.getEmail());
        account.setFullName(reg.getFullName());
        return authenticationRepository.save(account);
    }

    public AccountResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        ));
        // => account chuẩn

        Account account = authenticationRepository.findAccountByEmail(loginRequest.getEmail());
        if (account.isDeleted()) {
            throw new IllegalArgumentException("This account does not exist anymore.");
        }
        String token = tokenService.generateToken(account);

        AccountResponse accountResponse = new AccountResponse();
        accountResponse.setPhone(account.getPhone());
        accountResponse.setToken(token);
        accountResponse.setEmail(account.getEmail());
        accountResponse.setFullName(account.getFullName());
        accountResponse.setRole(account.getRole());
        accountResponse.setAccountId(account.getAccountId());

        return accountResponse;
    }

    public AccountResponse loginGoogle(LoginGoogleRequest loginGoogleRequest) {
        AccountResponse accountResponse = new AccountResponse();
        try {
            FirebaseToken firebaseToken = FirebaseAuth.getInstance().verifyIdToken(loginGoogleRequest.getToken());
            String email = firebaseToken.getEmail();
            Account account = authenticationRepository.findAccountByEmail(email);
            if (account == null) {
                account = new Account();
                account.setFullName(firebaseToken.getName());
                account.setEmail(firebaseToken.getEmail());
                account.setRole(RoleEnum.CUSTOMER);
                account = authenticationRepository.save(account);
            }
            accountResponse.setAccountId(account.getAccountId());
            accountResponse.setFullName(account.getFullName());
            accountResponse.setRole(RoleEnum.CUSTOMER);
            accountResponse.setEmail(account.getEmail());
            String token = tokenService.generateToken(account);
            accountResponse.setToken(token);
        }catch (FirebaseAuthException e){
            e.printStackTrace();
        }
        return accountResponse;
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return authenticationRepository.findAccountByEmail(email);
    }

    //Gửi mail to reset password
    public void forgotPassword(ForgotPasswordRequest forgotPasswordRequest) {
        System.out.println(forgotPasswordRequest.getEmail());
        Account account = authenticationRepository.findAccountByEmail(forgotPasswordRequest.getEmail());
        if (account == null) {
            try {
                throw new BadRequestException("Account not found!");
            }catch (RuntimeException e){
                throw new RuntimeException(e);
            }
        }
        EmailDetail emailDetail = new EmailDetail();
        emailDetail.setRecipient(account.getEmail());
        emailDetail.setSubject("Reset password for account " + forgotPasswordRequest.getEmail() + "!");
        emailDetail.setMsgBody("");
        emailDetail.setButtonValue("Reset password");
        emailDetail.setFullName(account.getFullName());
        emailDetail.setLink("http://badcourts.click/reset-password?token=" + tokenService.generateToken(account));
        Runnable r = new Runnable() {
            @Override
            public void run() {
                emailService.sendMailTemplate(emailDetail);
            }
        };
        new Thread(r).start();
    }

    public void setAccountStatus(Long accountId, boolean ban) {
        Account account = authenticationRepository.findById(accountId).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        account.setDeleted(ban);
        authenticationRepository.save(account);
    }

    //Gửi mail to set password cho clubowner
    public void setPassword(ForgotPasswordRequest forgotPasswordRequest) {
        System.out.println(forgotPasswordRequest.getEmail());
        Account account = authenticationRepository.findAccountByEmail(forgotPasswordRequest.getEmail());
        if (account == null) {
            try {
                throw new BadRequestException("Account not found!");
            }catch (RuntimeException e){
                throw new RuntimeException(e);
            }
        }
        EmailDetail emailDetail = new EmailDetail();
        emailDetail.setRecipient(account.getEmail());
        emailDetail.setSubject("Set password for account " + forgotPasswordRequest.getEmail() + "!");
        emailDetail.setMsgBody("");
        emailDetail.setButtonValue("Set password");
        emailDetail.setFullName(account.getFullName());
        emailDetail.setLink("http://badcourts.click/setPasswordActiveClub?token=" + tokenService.generateToken(account));
        Runnable r = new Runnable() {
            @Override
            public void run() {
                emailService.setPasswordMailTemplate(emailDetail);
            }
        };
        new Thread(r).start();
    }

    //Set password cho tài khoản clubowner rồi active club
    public void setPasswordActiveClub(ResetPasswordRequest resetPasswordRequest) {
        Account account = getCurrentAccount();
        account.setPassword(passwordEncoder.encode(resetPasswordRequest.getPassword()));
        authenticationRepository.save(account);
        Club club = clubRepository.findClubByAccount_AccountId(account.getAccountId());
        club.setDeleted(false);
        clubRepository.save(club);
    }

    public Account getCurrentAccount(){
        return (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
        Account account = getCurrentAccount();
        account.setPassword(passwordEncoder.encode(resetPasswordRequest.getPassword()));
        authenticationRepository.save(account);
    }

    public AccountManageResponseProfile getAccountByEmail(String email) {
        Account account = authenticationRepository.findAccountByEmail(email);
        AccountManageResponseProfile accountManageResponse = new AccountManageResponseProfile();
        if(account == null){
            try {
                throw new BadRequestException("Account not found!");
            }catch (RuntimeException e){
                throw new RuntimeException(e);
            }
        }
        else {
            accountManageResponse.setAccountId(account.getAccountId());
            accountManageResponse.setFullName(account.getFullName());
            accountManageResponse.setRole(account.getRole());
            accountManageResponse.setEmail(account.getEmail());
            accountManageResponse.setPassword(account.getPassword());
            accountManageResponse.setPhone(account.getPhone());
            return accountManageResponse;
        }
    }
    public void sendOTPEmailConfirmation(String email,String otp){
        System.out.println(email);
        EmailDetail emailDetail = new EmailDetail();
        emailDetail.setRecipient(email);
        emailDetail.setSubject("OTP confirmation");
        emailDetail.setMsgBody("");
        Runnable r = new Runnable() {
            @Override
            public void run() {
                emailService.setOTPMailTemplate(emailDetail,otp);
            }
        };
        new Thread(r).start();
    }
}
