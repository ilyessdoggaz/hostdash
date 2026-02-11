package com.cubeit.erp_agence.repository;

import com.cubeit.erp_agence.model.Agency;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AgencyRepository extends MongoRepository<Agency, String> {
    Optional<Agency> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRne(String rne);
}