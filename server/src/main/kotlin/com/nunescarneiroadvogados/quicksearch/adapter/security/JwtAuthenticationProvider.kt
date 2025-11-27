package com.nunescarneiroadvogados.quicksearch.adapter.security

import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication

class JwtAuthenticationProvider: AuthenticationProvider {
    override fun authenticate(authentication: Authentication?): Authentication? {
        return authentication?.apply { isAuthenticated = true }
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return JwtAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

}