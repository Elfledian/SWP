package click.badcourt.be.repository;

import click.badcourt.be.entity.Account;
import click.badcourt.be.enums.RoleEnum;
import com.google.api.services.storage.Storage;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthenticationRepository extends JpaRepository<Account, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE Account a SET a.balance = ?1 WHERE a.accountId = ?2")
    void updateBalance(float balance, Long accountId);
    Account findAccountByEmail( String email);
    List<Account> findAccountsByIsDeletedFalse();
    Account findAccountByAccountId(Long accountId);
}
