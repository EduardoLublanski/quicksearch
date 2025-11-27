package com.nunescarneiroadvogados.quicksearch.adapter.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class AuthenticationManagerConfig(
    private val userDetailsService: UserDetailsServiceImp,
    private val passwordEncoder: PasswordEncoder
) {
    @Bean
    fun authenticationManager(): AuthenticationManager {

        val daoAuthenticationProvider = DaoAuthenticationProvider(userDetailsService).apply { setPasswordEncoder(passwordEncoder) }
        val jwtAuthenticationProvider = JwtAuthenticationProvider()

        return ProviderManager(daoAuthenticationProvider, jwtAuthenticationProvider)

    }
}