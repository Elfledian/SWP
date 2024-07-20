package click.badcourt.be.api;

import click.badcourt.be.entity.Account;
import click.badcourt.be.model.request.*;
import click.badcourt.be.model.response.AccountManageResponse;
import click.badcourt.be.model.response.AccountManageResponseProfile;
import click.badcourt.be.model.response.AccountResponse;
import click.badcourt.be.repository.AuthenticationRepository;
import click.badcourt.be.service.AccountService;
import click.badcourt.be.service.AuthenticationService;
import click.badcourt.be.service.EmailService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "api")
public class AuthenticationApi {

    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    private AuthenticationRepository authenticationRepository;

    @Autowired
    private AccountService accountService;
    private String generatedOtp;

    @PostMapping("/sendOTP")
    public ResponseEntity sendOtp(@RequestBody RegisterRequest registerRequest) {
        if (!AuthenticationService.isValidEmail(registerRequest.getEmail()) || !AuthenticationService.isValidPhone(registerRequest.getPhone())) {
            return ResponseEntity.badRequest().body("Invalid input data");
        }

        String generatedOtp = AuthenticationService.generateOTP(6);
        AuthenticationService.saveOtpHash(registerRequest.getEmail(), AuthenticationService.hashOtp(generatedOtp));

        authenticationService.sendOTPEmailConfirmation(registerRequest.getEmail(), generatedOtp);
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestParam String otp, @RequestBody RegisterRequest registerRequest) {
        if (!AuthenticationService.isOtpValid(registerRequest.getEmail(),otp) || !AuthenticationService.isValidEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Invalid input data");
        }

        if (AuthenticationService.isOtpValid(registerRequest.getEmail(), otp)) {
            Account account = authenticationService.register(registerRequest);
            return ResponseEntity.ok(account);
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }
    }

    @PostMapping("/registeradmin")
    public ResponseEntity registerAdmin(@RequestBody RegisterRequest registerRequest) {
        Account account= authenticationService.registerAdmin(registerRequest);
        return ResponseEntity.ok(account);
    }

//    @PreAuthorize("hasAuthority('ADMIN')")
//    @PostMapping("/registerclubowner")
//    public ResponseEntity registerClubOwner(@RequestBody RegisterRequest registerRequest) {
//        Account account= authenticationService.registerClubOwner(registerRequest);
//        return ResponseEntity.ok(account);
//    }


//    @PreAuthorize("hasAuthority('ClUB_OWNER')")
    @PostMapping("/registerstaff")
    public ResponseEntity registerStaff(@RequestBody RegisterRequest registerRequest) {
        Account account= authenticationService.registerStaff(registerRequest);
        return ResponseEntity.ok(account);
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authenticationService.login(loginRequest));
    }

    @PostMapping("/login-google")
    public ResponseEntity<AccountResponse> loginGoogle(@RequestBody LoginGoogleRequest loginRequest) {
        return ResponseEntity.ok(authenticationService.loginGoogle(loginRequest));
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        authenticationService.forgotPassword(forgotPasswordRequest);
    }

    @PostMapping("/set-password")
    public void setPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        authenticationService.setPassword(forgotPasswordRequest);
    }

    @PostMapping("/setPasswordActiveClub")
    public void setPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        authenticationService.setPasswordActiveClub(resetPasswordRequest);
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        authenticationService.resetPassword(resetPasswordRequest);
    }

    @PutMapping("/setAccountStatus/{accId}/{ban}")
    public void setAccountStatusByID(@PathVariable Long accId, @PathVariable boolean ban) {
        authenticationService.setAccountStatus(accId, ban);
    }

    @PutMapping("/updateNameAndPhone")
    public ResponseEntity updateFullNameAndPhone(@RequestBody AccountUpdateRequest accountUpdateRequest) {
        try{
            authenticationService.updateNameAndPhone(accountUpdateRequest);
            return new ResponseEntity<>("Update Successfully !", HttpStatus.OK);
        }catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/account/{email}")
    public ResponseEntity getAccount(@PathVariable String email) {
        AccountManageResponseProfile account= authenticationService.getAccountByEmail(email);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/accounts")
    public ResponseEntity getAccounts() {
        return ResponseEntity.ok(accountService.getAllAccount());
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/updateStatus")
    public String updateAccount(@RequestParam Long accountId, @RequestBody BanUnbanAccountRequest banUnbanAccountRequest) {
        Account account = authenticationRepository.findById(accountId).orElseThrow(()-> new RuntimeException("Account not found"));
        if (banUnbanAccountRequest.isStatus()){
            account.setDeleted(true);
            authenticationRepository.save(account);
            return "Account of " + account.getEmail() + " banned!";
        } else {
            account.setDeleted(false);
            authenticationRepository.save(account);
            return "Account of " + account.getEmail() + " unbaned!";
        }
    }
}
