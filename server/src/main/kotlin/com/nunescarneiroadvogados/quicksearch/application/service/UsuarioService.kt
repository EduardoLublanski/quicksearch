package com.nunescarneiroadvogados.quicksearch.application.service

import com.nunescarneiroadvogados.quicksearch.adapter.security.Usuario
import com.nunescarneiroadvogados.quicksearch.adapter.security.UsuarioRepository
import com.nunescarneiroadvogados.quicksearch.domain.dto.UserRoleDto
import com.nunescarneiroadvogados.quicksearch.domain.dto.UsuarioDto
import com.nunescarneiroadvogados.quicksearch.domain.security.UserRole
import jakarta.transaction.Transactional
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UsuarioService(
    val usuarioRepository: UsuarioRepository,
    val passwordEncoder: PasswordEncoder) {

    fun register(newUsuario: Usuario): Usuario = usuarioRepository.save(newUsuario.apply { passcode = passwordEncoder.encode(newUsuario.passcode) })

    fun list(): List<Usuario> = usuarioRepository.findAll()

    @Transactional
    fun update(usuarioDto: UsuarioDto): Usuario {
        val usuario = usuarioRepository.findById(usuarioDto.id).get()
        usuario.apply {
            login = usuarioDto.username
            passcode = passwordEncoder.encode(usuarioDto.password)
            roles = usuarioDto.roles
        }
        return usuarioRepository.save(usuario)
    }

    fun delete(id: Long): Unit {
        if(id === 1L && usuarioRepository.findById(id).get().roles.contains(UserRole.ROLE_ADMIN)) throw IllegalArgumentException("o administrador não pode ser deletado")
        usuarioRepository.deleteById(id)
    }

    fun updateRole(id: Long, newRoleDto: UserRoleDto): Usuario {
        val usuario = usuarioRepository.findById(id).get()
        usuario.roles = mutableListOf(newRoleDto.role)

        return usuarioRepository.save(usuario)
    }
}