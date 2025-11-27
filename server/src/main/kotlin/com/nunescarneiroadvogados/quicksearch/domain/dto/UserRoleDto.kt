package com.nunescarneiroadvogados.quicksearch.domain.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.nunescarneiroadvogados.quicksearch.domain.security.UserRole

data class UserRoleDto(
    @field: JsonProperty("new_user_role")
    val role: UserRole
)
