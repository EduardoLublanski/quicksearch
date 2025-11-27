package com.nunescarneiroadvogados.quicksearch

import com.nunescarneiroadvogados.quicksearch.adapter.security.Usuario
import com.nunescarneiroadvogados.quicksearch.adapter.security.UsuarioRepository
import com.nunescarneiroadvogados.quicksearch.domain.security.UserRole
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class AdminInitializer(
    private val shooterDataManager: UsuarioRepository,
    private val passwordEncoder: PasswordEncoder,
): CommandLineRunner {

    override fun run(vararg args: String?) {
        val admin = shooterDataManager.findFirstByRolesContaining(UserRole.ROLE_ADMIN)
        if (admin == null) {
            shooterDataManager.save(
                Usuario(
                    login = "adm",
                    passcode = passwordEncoder.encode("12345678"),
                    roles = mutableListOf(UserRole.ROLE_ADMIN)
                )
            )

        }
    }
}