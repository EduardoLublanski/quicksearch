package com.nunescarneiroadvogados.quicksearch.adapter.security

import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration

@Configuration
@EnableMethodSecurity
class SecurityConfig(
    private val jwtFilter: JwtFilter,
    private val loginFilter: LoginFilter
) {

    @Bean
    fun securityFilter(http: HttpSecurity): SecurityFilterChain {
        val baseUrl = "/api/v1/quicksearch"

        http
            .cors { it.configurationSource {
                CorsConfiguration().apply {
                    allowedOrigins = listOf("http://localhost:3000")
                    allowedMethods = listOf("GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS")
                    allowedHeaders = listOf("*")
                    allowCredentials = true
                }
            } }
            .formLogin { it.disable() }
            .logout { it.disable() }
            .csrf { it.disable() }
            .headers { it.frameOptions { it.disable() } }

            .authorizeHttpRequests { auth ->
                auth.requestMatchers("$baseUrl/jwt-auth").permitAll()
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                auth.anyRequest().authenticated() // todos os outros endpoints exigem autenticação
            }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter::class.java)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter::class.java)
            .exceptionHandling { exceptions ->
                exceptions.accessDeniedHandler { _, response, _ ->
                    response.status = HttpServletResponse.SC_FORBIDDEN
                    response.contentType = "application/json"
                    response.writer.write("""{"error":"Insufficient authorities"}""")
                }
                exceptions.authenticationEntryPoint { _, response, _ ->
                    response.status = HttpServletResponse.SC_UNAUTHORIZED
                    response.contentType = "application/json"
                    response.writer.write("""{"error":"usuário ou senha inválidos"}""")
                }
            }

        return http.build()
    }
}
