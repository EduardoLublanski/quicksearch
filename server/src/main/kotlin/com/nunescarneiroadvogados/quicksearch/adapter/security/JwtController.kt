package com.nunescarneiroadvogados.quicksearch.adapter.security

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("api/v1/quicksearch/jwt")
class JwtController(val jwtService: JwtService) {

    @GetMapping()
    fun isTokenExpired(@RequestHeader("Authorization") authHeader: String): ResponseEntity<Map<String, String>?> {
        val token = authHeader.removePrefix("Bearer ").trim()
        val isExpired = jwtService.isTokenExpired(token)
        return ResponseEntity.ok(mapOf("expired" to isExpired.toString()))
    }

    @GetMapping("/me")
    fun getRoles(@RequestHeader("Authorization") authHeader: String): ResponseEntity<Map<String, List<String>>> {
        val token = authHeader.removePrefix("Bearer ").trim()
        val roles = jwtService.getRoles(token)
        return ResponseEntity.ok(mapOf("roles" to roles))
    }

    @GetMapping("/me/username")
    fun getUsername(@RequestHeader("Authorization") authHeader: String): ResponseEntity<Map<String, String>> {
        val token = authHeader.removePrefix("Bearer ").trim()
        val username = jwtService.getSubject(token)
        return ResponseEntity.ok(mapOf("username" to username))
    }

}