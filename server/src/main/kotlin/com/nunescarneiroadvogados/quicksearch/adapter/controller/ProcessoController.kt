package com.nunescarneiroadvogados.quicksearch.adapter.controller

import com.nunescarneiroadvogados.quicksearch.application.service.ProcessoService
import com.nunescarneiroadvogados.quicksearch.domain.dto.DocumentoDto
import com.nunescarneiroadvogados.quicksearch.domain.dto.PrazoDto
import com.nunescarneiroadvogados.quicksearch.domain.dto.ProcessoDto
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Documento
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Prazo
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Processo
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@CrossOrigin(origins = ["http://localhost:3000"])
@RestController
@RequestMapping("api/v1/quicksearch/cliente/processo")
class ProcessoController(
    val processoService: ProcessoService,
) {

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    fun postProcesso(@RequestBody processoDto: ProcessoDto): ResponseEntity<Processo> {

        val registeredProcesso = processoService.register(processoDto)
        return ResponseEntity.ok(registeredProcesso)
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'GUEST', 'MANAGER')")
    fun listProcessos(): ResponseEntity<List<Processo>> {
        val processos = processoService.list()

        return ResponseEntity.ok(processos)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    fun deleteProcesso(@PathVariable id: Long): ResponseEntity<Map<String,String>> {
        println("id do processo: $id")
        processoService.delete(id)

        return ResponseEntity.ok(mapOf("mensagem" to "cliente $id excluído"))
    }

    @PatchMapping("/{id}/documento")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    fun postDocumento(@PathVariable id: Long, @RequestBody documento: DocumentoDto): ResponseEntity<Processo> {
        val updatedProcesso = processoService.addDocumentoByProcessoId(id, documento)

        return ResponseEntity.ok(updatedProcesso)
    }

    @PatchMapping("/{id}/prazo")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    fun postPrazo(@PathVariable id: Long, @RequestBody prazo: PrazoDto): ResponseEntity<Processo> {
        val updatedProcesso = processoService.addPrazoByProcessoId(id, prazo)

        return ResponseEntity.ok(updatedProcesso)
    }

    @GetMapping("/{id}/documento")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'GUEST', 'MANAGER')")
    fun getDocumentos(@PathVariable id: Long): ResponseEntity<List<Documento>> {
        val documentos = processoService.findDocumentosByProcessoId(id)

        return ResponseEntity.ok(documentos)
    }

    @GetMapping("/{id}/prazo")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'GUEST', 'MANAGER')")
    fun getPrazos(@PathVariable id: Long): ResponseEntity<List<Prazo>> {
        val prazos = processoService.findPrazosByProcessoId(id)

        return ResponseEntity.ok(prazos)
    }

    @DeleteMapping("/{processo-id}/documento/{documento-id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    fun DeleteDocumento(
        @PathVariable("processo-id") processId: Long,
        @PathVariable("documento-id") documentoId: Long
    ): ResponseEntity<Processo> {
        val processo = processoService.deleteDocumentoById(processId, documentoId)

        return ResponseEntity.ok(processo)
    }

    @DeleteMapping("/{processo-id}/prazo/{prazo-id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    fun DeletePrazo(
        @PathVariable("processo-id") processoId: Long,
        @PathVariable("prazo-id") prazoId: Long
    ): ResponseEntity<Processo> {
        val processo = processoService.deletePrazoById(processoId, prazoId)

        return ResponseEntity.ok(processo)
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    fun updateProcesso(@PathVariable id: Long,  @RequestBody processoDto: ProcessoDto): ResponseEntity<Processo> {
        val updatedProcesso = processoService.updateProcesso(id, processoDto)

        return ResponseEntity.ok(updatedProcesso)
    }
}