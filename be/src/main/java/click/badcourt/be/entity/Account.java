package click.badcourt.be.entity;

import click.badcourt.be.enums.RoleEnum;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@JsonIgnoreProperties({"club"})
public class Account implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)//auto generate id
    @Column(name = "account_id")
    Long accountId;

    float balance = 0;

    String password;

    @Column(unique = true)
    String phone;

    @Column(unique = true)
    String email;

    String fullName;
    boolean isDeleted;
    @JsonManagedReference
    @OneToMany(mappedBy = "account")
    List<Booking> bookings;

    @OneToMany(mappedBy = "account")
    List<FeedBack> feedBacks;

    @OneToOne(mappedBy = "account")
    Club club;

    @Enumerated(EnumType.STRING)
    RoleEnum role;
    @JsonIgnore
    @OneToMany(mappedBy = "fromaccount")
    private Set<Transaction> transactionsFrom;

    @JsonIgnore
    @OneToMany(mappedBy = "toaccount", cascade = CascadeType.ALL)
    private Set<Transaction> transactionsTo;
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.toString()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
