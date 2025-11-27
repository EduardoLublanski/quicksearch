package com.nunescarneiroadvogados.quicksearch.adapter.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.util.PathMatcher
import org.springframework.web.filter.OncePerRequestFilter
import kotlin.text.removePrefix
import kotlin.text.startsWith

@Component
class JwtFilter(
    private val authenticationManager: AuthenticationManager,
    private val jwtService: JwtService,
    private val userDetailsService: UserDetailsServiceImp,
    private val pathMatcher: PathMatcher,
): OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val publicUrls = listOf("/api/v1/quicksearch/jwt-auth")

        if (publicUrls.any { pathMatcher.match(it, request.servletPath) }) {

            val authorities = listOf(SimpleGrantedAuthority("ROLE_ANONYMOUS"))
            val authentication = AnonymousAuthenticationToken(
                "anonymousUser", "anonymousUser", authorities
            )
            SecurityContextHolder.getContext().authentication = authentication

            filterChain.doFilter(request, response)

            return
        }

        if (request.method.equals("OPTIONS", ignoreCase = true)) {
            response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
            response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
            response.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type")
            response.setHeader("Access-Control-Allow-Credentials", "true")
            response.status = HttpServletResponse.SC_OK
            return
        }

        val requestHeader = request.getHeader("Authorization")

        if(requestHeader == null || !requestHeader.startsWith("Bearer ") || SecurityContextHolder.getContext().authentication != null) {
            filterChain.doFilter(request, response)
            return
        }

        val token = requestHeader.removePrefix("Bearer ")

        try {

            val subject = jwtService.getSubject(token)
            val userDetails = userDetailsService.loadUserByUsername(subject)
            val roles = jwtService.getRoles(token)
            val jwtAuthenticationToken = JwtAuthenticationToken(userDetails.username, token, roles)
            val authentication = authenticationManager.authenticate(jwtAuthenticationToken)

            SecurityContextHolder.getContext().authentication = authentication
            filterChain.doFilter(request, response)
        } catch(exception: Exception) {
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            response.contentType = "application/json"
            response.writer.write("""{"error":"Invalid or expired token","message":"${exception.message}"}""")
        }

    }


}