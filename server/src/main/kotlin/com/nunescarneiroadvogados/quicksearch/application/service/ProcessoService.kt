package com.nunescarneiroadvogados.quicksearch.application.service

import com.nunescarneiroadvogados.quicksearch.adapter.repository.AdvogadoRepository
import com.nunescarneiroadvogados.quicksearch.adapter.repository.ClienteRepository
import com.nunescarneiroadvogados.quicksearch.adapter.repository.DocumentoRepository
import com.nunescarneiroadvogados.quicksearch.adapter.repository.PrazoRepository
import com.nunescarneiroadvogados.quicksearch.adapter.repository.ProcessoRepository
import com.nunescarneiroadvogados.quicksearch.domain.dto.DocumentoDto
import com.nunescarneiroadvogados.quicksearch.domain.dto.PrazoDto
import com.nunescarneiroadvogados.quicksearch.domain.dto.ProcessoDto
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Documento
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Prazo
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Processo
import jakarta.transaction.Transactional

import org.springframework.stereotype.Service


@Service
class ProcessoService(
    private val processoRepository: ProcessoRepository,
    private val clienteRepository: ClienteRepository,
    private val advogadoRepository: AdvogadoRepository,
    private val documentoRepository: DocumentoRepository,
    private val prazoRepository: PrazoRepository,
) {

    @Transactional
    fun register(processoDto: ProcessoDto): Processo {

        val processo = Processo(
            tipo = processoDto.tipo,
            vara = processoDto.vara,
            numero = processoDto.numero,
            status = processoDto.status,
            cliente = clienteRepository.findById(processoDto.clienteCpf).orElseThrow { IllegalArgumentException("cpf ${processoDto.clienteCpf} não encontrado") },
            advogadoResponsavel = advogadoRepository.findById(processoDto.codigoOab).orElseThrow { IllegalArgumentException("cpf ${processoDto.clienteCpf} não encontrado") },
            descricao = processoDto.descricao,
            localizacao = processoDto.localizacao,
            valorCausa = processoDto.valorCausa,
            dataAbertura = processoDto.dataAbertura,
            dataEncerramento = processoDto.dataEncerramento
        )

        processo.documentosPendentes = processoDto.documentosPendentes.toMutableList()
        processo.prazosProcessuais = processoDto.prazosProcessuais.toMutableList()

        return processoRepository.save(processo)
    }

    fun list(): List<Processo> = processoRepository.findAll()


    fun delete(id: Long): Unit {
        processoRepository.deleteById(id)
    }

    fun addDocumentoByProcessoId(processoId: Long, documentoDto: DocumentoDto): Processo {
        val processo = processoRepository.findById(processoId).orElseThrow { IllegalArgumentException("processo $processoId não encontrado") }
        val documento = Documento(
            descricao = documentoDto.descricao,
            processo = processo
        )
        processo.documentosPendentes.add(documento)
        return processoRepository.save(processo)
    }

    fun addPrazoByProcessoId(processoId: Long, prazoDto: PrazoDto): Processo {
        val processo = processoRepository.findById(processoId).orElseThrow { IllegalArgumentException("processo $processoId não encontrado") }
        val prazo = Prazo(
            assunto = prazoDto.assunto,
            dataHora = prazoDto.dataHora,
            processo = processo
        )
        processo.prazosProcessuais.add(prazo)
        return processoRepository.save(processo)
    }

    fun findDocumentosByProcessoId(processoId: Long): List<Documento> {
        val documentos = processoRepository.findById(processoId).get().documentosPendentes
        return documentos
    }

    fun findPrazosByProcessoId(processoId: Long): List<Prazo> {
        val prazos = processoRepository.findById(processoId).get().prazosProcessuais

        return prazos
    }

    fun deleteDocumentoById(processoId: Long, documentoId: Long): Processo {
        val processo = processoRepository.findById(processoId).get()
        processo.documentosPendentes.remove(documentoRepository.findById(documentoId).get())
        processoRepository.save(processo)

        return processo
    }

    fun deletePrazoById(processoId: Long, prazoId: Long): Processo {
        val processo = processoRepository.findById(processoId).get()
        processo.prazosProcessuais.remove(prazoRepository.findById(prazoId).get())
        processoRepository.save(processo)

        return processo
    }

    @Transactional
    fun updateProcesso(id: Long, dto: ProcessoDto): Processo {
        val processo = processoRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Processo com id $id não encontrado") }

        processo.apply {
            tipo = dto.tipo
            vara = dto.vara
            numero = dto.numero
            status = dto.status
            descricao = dto.descricao
            localizacao = dto.localizacao
            valorCausa = dto.valorCausa
            dataAbertura = dto.dataAbertura
            dataEncerramento = dto.dataEncerramento
            cliente = clienteRepository.findById(dto.clienteCpf)
                .orElseThrow { IllegalArgumentException("Cliente não encontrado") }
            advogadoResponsavel = advogadoRepository.findById(dto.codigoOab)
                .orElseThrow { IllegalArgumentException("Advogado não encontrado") }

            // ⚠️ Atualize listas corretamente:
            documentosPendentes.clear()
            documentosPendentes.addAll(
                dto.documentosPendentes.map {
                    it.copy(processo = this) // garante que o documento aponte para o processo atual
                }
            )

            prazosProcessuais.clear()
            prazosProcessuais.addAll(
                dto.prazosProcessuais.map {
                    it.copy(processo = this)
                }
            )
        }

        return processoRepository.save(processo)
    }


}

