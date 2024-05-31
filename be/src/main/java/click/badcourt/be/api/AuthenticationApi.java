package click.badcourt.be.api;

import click.badcourt.be.entity.Account;
import click.badcourt.be.model.LoginRequest;
import click.badcourt.be.model.RegisterRequest;
import click.badcourt.be.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthenticationApi {
    @Autowired
    AuthenticationService authenticationService;

    @PostMapping("register")
    public ResponseEntity register(@RequestBody RegisterRequest registerRequest) {
        Account account= authenticationService.register(registerRequest);
        return ResponseEntity.ok(account);
    }

    @PostMapping("login")
    public ResponseEntity login(@RequestBody LoginRequest loginRequest) {
        Account account =  authenticationService.login(loginRequest);
        return ResponseEntity.ok(account);
    }


}