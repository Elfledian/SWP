package click.badcourt.be.repository;

import click.badcourt.be.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findClubsByDeletedFalse();
    List<Club> findClubsByDeletedTrue();
    List<Club> findClubsByAddress(String address);
    Club findClubByClubId(Long id);
    Club findClubByAccount_AccountId(Long accountId);
}
