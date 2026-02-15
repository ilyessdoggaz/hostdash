package com.cubeit.erp_agence.service;

import com.cubeit.erp_agence.model.Agency;
import com.cubeit.erp_agence.repository.AgencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AgencyRepository agencyRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Agency agency = agencyRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Agence non trouvée avec l'email : " + email));

        return User.builder()
                .username(agency.getEmail())
                .password(agency.getPassword())
                .roles("AGENCE")
                .build();
    }
}