package com.nunescarneiroadvogados.quicksearch.adapter.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority

class JwtAuthenticationToken(
    private val username: String,
    private val token: String,
    private val authorities: List<String>
) : AbstractAuthenticationToken(authorities.map { SimpleGrantedAuthority(it) }) {
    override fun getCredentials() = token
    override fun getPrincipal() = username
}