package com.nunescarneiroadvogados.quicksearch.adapter.security

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.stereotype.Component

@Component
class LoginFilter(
    private val authenticationManager: AuthenticationManager,
    private val jwtService: JwtService,
    private val objectMapper: ObjectMapper
): UsernamePasswordAuthenticationFilter() {

    init {
        setFilterProcessesUrl("/api/v1/quicksearch/login")
        setAuthenticationManager(authenticationManager)
    }

    override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication {
        val credentials = objectMapper.readValue(request.inputStream, Credentials::class.java)
        val authentication = UsernamePasswordAuthenticationToken(credentials.username, credentials.password)
        val authResult = authenticationManager.authenticate(authentication)
        println(authResult.toString())
        return authResult
    }

    override fun successfulAuthentication(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain?,
        authResult: Authentication
    ) {
        val userDetails = authResult.principal as Usuario
        val jwtToken = jwtService.generateToken(userDetails)
        response.contentType = "application/json"
        response.writer.write(objectMapper.writeValueAsString(mapOf("token" to jwtToken)))
    }
}