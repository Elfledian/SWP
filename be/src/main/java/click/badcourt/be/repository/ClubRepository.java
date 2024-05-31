package click.badcourt.be.repository;

import click.badcourt.be.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findClubsByDeletedFalse();
}
