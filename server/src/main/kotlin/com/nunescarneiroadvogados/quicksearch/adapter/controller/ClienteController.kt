package com.nunescarneiroadvogados.quicksearch.adapter.controller


import com.nunescarneiroadvogados.quicksearch.application.service.ClienteService
import com.nunescarneiroadvogados.quicksearch.domain.entity.Cliente
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@CrossOrigin(origins = ["http://localhost:3000"])
@RestController
@RequestMapping("api/v1/quicksearch/cliente")
class ClienteController(
    val clienteService: ClienteService
) {
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    fun postCliente(@RequestBody @Validated newCliente: Cliente): ResponseEntity<Cliente> {
        val registeredCliente = clienteService.register(newCliente)

        return ResponseEntity.ok(newCliente)
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'GUEST', 'MANAGER')")
    fun getClientes(): ResponseEntity<List<Cliente>> {
        val clientes = clienteService.list()

        return ResponseEntity.ok(clientes)
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER', 'USER')")
    fun putCliente(@RequestBody @Validated updatedAdvogadoData: Cliente): ResponseEntity<Cliente> {
        val updatedCliente = clienteService.register(updatedAdvogadoData)

        return ResponseEntity.ok(updatedCliente)
    }

    @DeleteMapping("/{cpf}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    fun deleteCliente(@PathVariable cpf: String, authentication: org.springframework.security.core.Authentication): ResponseEntity<Map<String,String>> {
        println("Usuário autenticado: ${authentication.name}")
        println("Authorities: ${authentication.authorities}")
        clienteService.deleteByCpf(cpf)

        return ResponseEntity.ok(mapOf("mensagem" to "cliente $cpf excluído"))
    }
}