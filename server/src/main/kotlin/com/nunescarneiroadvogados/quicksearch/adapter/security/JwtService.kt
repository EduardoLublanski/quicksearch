package com.nunescarneiroadvogados.quicksearch.adapter.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.Date

@Service
class JwtService(
    @Value("\${spring.jwt.secretKey}")
    private val secretKey: String
) {

    fun generateToken(userdetails: UserDetails): String {
        val now = System.currentTimeMillis()
        val roles = userdetails.authorities.map { it.toString() }

        return Jwts
            .builder()
            .subject(userdetails.username)
            .claim("roles", roles)
            .issuedAt(Date(now))
            .expiration(Date(now + 1000 * 60 * 60 * 24))
            .signWith(Keys.hmacShaKeyFor(secretKey.toByteArray()))
            .compact()
    }

    private fun extractClaims(token: String): Claims {
        return Jwts
            .parser()
            .verifyWith(Keys.hmacShaKeyFor(secretKey.toByteArray()))
            .build()
            .parseSignedClaims(token)
            .payload
    }
    fun getSubject(token: String): String = extractClaims(token).subject

    fun getRoles(token: String): List<String> {
        val roleClaims = extractClaims(token)["roles"]

        return if(roleClaims is List<*>) {
            roleClaims.filterIsInstance<String>()
        }
        else emptyList()
    }

    fun isTokenExpired(token: String): Boolean {
        val isExpired = try {
            extractClaims(token).expiration.toInstant().isBefore(Instant.now())
        } catch (ex: Exception) {
            return true
        }
        return isExpired
    }
}