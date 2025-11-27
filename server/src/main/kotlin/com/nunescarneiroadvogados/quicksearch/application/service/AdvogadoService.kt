package com.nunescarneiroadvogados.quicksearch.application.service

import com.nunescarneiroadvogados.quicksearch.adapter.repository.AdvogadoRepository
import com.nunescarneiroadvogados.quicksearch.domain.entity.Advogado
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException
import org.springframework.stereotype.Service

@Service
class AdvogadoService(
    val advogadoRepository: AdvogadoRepository
) {

    fun list(): List<Advogado> = advogadoRepository.findAll()

    fun register(advogado: Advogado): Advogado = advogadoRepository.save(advogado)

    fun deleteByCodigoOAB(codigoOAB: String): Unit = advogadoRepository.deleteById(codigoOAB)

    fun findByOabCode(oabCode: String): Advogado {
        val advogado = advogadoRepository.findById(oabCode).orElseThrow { IllegalArgumentException("advogado $oabCode não encontrado") }

        return advogado
    }

}