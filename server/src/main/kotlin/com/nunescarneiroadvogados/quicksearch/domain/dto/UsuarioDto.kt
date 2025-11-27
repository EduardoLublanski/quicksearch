package com.nunescarneiroadvogados.quicksearch.domain.dto

import com.nunescarneiroadvogados.quicksearch.domain.security.UserRole

data class UsuarioDto(
    val id: Long = 0,
    val username: String = "",
    val password: String = "",
    val roles: MutableList<UserRole> = mutableListOf(UserRole.ROLE_GUEST)
)