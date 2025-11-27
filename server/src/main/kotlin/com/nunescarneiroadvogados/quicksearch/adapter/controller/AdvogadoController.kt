package com.nunescarneiroadvogados.quicksearch.adapter.controller

import com.nunescarneiroadvogados.quicksearch.application.service.AdvogadoService
import com.nunescarneiroadvogados.quicksearch.domain.entity.Advogado
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
@RequestMapping("api/v1/quicksearch/advogado")
class AdvogadoController(
    val advogadoService: AdvogadoService
) {
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    fun postAdvogado(@RequestBody @Validated newAdvogado: Advogado): ResponseEntity<Advogado> {
        val registeredAdvogado = advogadoService.register(newAdvogado)

        return ResponseEntity.ok(newAdvogado)
    }
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'GUEST', 'MANAGER')")
    fun getAdvogados(): ResponseEntity<List<Advogado>> {
        val advogados = advogadoService.list()

        return ResponseEntity.ok(advogados)
    }

    @GetMapping("/{codigo-oab}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'GUEST', 'MANAGER')")
    fun getAdvogadoByOabCode(@PathVariable("codigo-oab") codigoOAB: String): ResponseEntity<Advogado> {
        val advogado = advogadoService.findByOabCode(codigoOAB)

        return ResponseEntity.ok(advogado)
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'MANAGER')")
    fun putAdvogado(@RequestBody @Validated updatedAdvogadoData: Advogado): ResponseEntity<Advogado> {
        val updatedAdvogado = advogadoService.register(updatedAdvogadoData)

        return ResponseEntity.ok(updatedAdvogado)
    }

    @DeleteMapping("/{codigo-oab}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    fun deleteAdvogado(@PathVariable("codigo-oab") codigoOAB: String): ResponseEntity<Map<String,String>> {
        advogadoService.deleteByCodigoOAB(codigoOAB)

        return ResponseEntity.ok(mapOf("mensagem" to "cliente $codigoOAB excluído"))
    }
}