package com.nunescarneiroadvogados.quicksearch.adapter.security

import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserDetailsServiceImp(val usuarioRepository: UsuarioRepository): UserDetailsService {
    override fun loadUserByUsername(username: String): UserDetails {

        val usuario = usuarioRepository.findByLogin(username)
            .orElseThrow { UsernameNotFoundException("Usuário $username não encontrado") }

        return usuario
    }
}