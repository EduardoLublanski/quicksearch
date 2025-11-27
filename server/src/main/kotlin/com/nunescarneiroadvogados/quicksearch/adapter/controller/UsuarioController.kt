package com.nunescarneiroadvogados.quicksearch.adapter.controller

import com.nunescarneiroadvogados.quicksearch.adapter.security.Usuario
import com.nunescarneiroadvogados.quicksearch.application.service.UsuarioService
import com.nunescarneiroadvogados.quicksearch.domain.dto.UserRoleDto
import com.nunescarneiroadvogados.quicksearch.domain.dto.UsuarioDto
import com.nunescarneiroadvogados.quicksearch.domain.security.UserRole
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@RestController
@RequestMapping("/api/v1/quicksearch/usuario")
class UsuarioController(val usuarioService: UsuarioService) {

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun postUsuario(@RequestBody usuarioDto: UsuarioDto): ResponseEntity<Usuario> {

        val newUsuario = usuarioService.register(Usuario(
            login = usuarioDto.username,
            passcode = usuarioDto.password,
            roles = usuarioDto.roles
        ))

        val uri = URI.create("/api/v1/usuario")
        return ResponseEntity.created(uri).body(newUsuario)
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun listUsuarios(): ResponseEntity<List<Usuario>> {
        val usuarios = usuarioService.list()

        return ResponseEntity.ok(usuarios)
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun putUsuario(@RequestBody usuarioDto: UsuarioDto): ResponseEntity<Usuario> {

        val updatedUsuario = usuarioService.update(usuarioDto)

        return ResponseEntity.ok(updatedUsuario)
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun patchUsuario(@PathVariable("id") usuarioId: Long, @RequestBody userRoleDto: UserRoleDto): ResponseEntity<Usuario> {

        val updatedUsuario = usuarioService.updateRole(usuarioId, userRoleDto)

        return ResponseEntity.ok(updatedUsuario)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteUsuario(@PathVariable id: Long): ResponseEntity<Map<String,String>> {
        usuarioService.delete(id)

        return ResponseEntity.ok(mapOf("usuário id" to "foi deletado"))
    }
}