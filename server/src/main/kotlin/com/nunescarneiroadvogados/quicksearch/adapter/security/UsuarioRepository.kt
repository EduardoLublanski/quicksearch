package com.nunescarneiroadvogados.quicksearch.adapter.security

import com.nunescarneiroadvogados.quicksearch.domain.security.UserRole
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UsuarioRepository: JpaRepository<Usuario, Long> {
    fun findByLogin(login: String): Optional<Usuario>
    fun findFirstByRolesContaining(userRole: UserRole): Usuario?
}