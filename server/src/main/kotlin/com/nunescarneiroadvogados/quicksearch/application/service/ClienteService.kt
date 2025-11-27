package com.nunescarneiroadvogados.quicksearch.application.service

import com.nunescarneiroadvogados.quicksearch.adapter.repository.ClienteRepository
import com.nunescarneiroadvogados.quicksearch.domain.entity.Cliente
import org.springframework.stereotype.Service

@Service
class ClienteService(
    val clienteRepository: ClienteRepository
) {
    fun register(newCliente: Cliente): Cliente = clienteRepository.save(newCliente)

    fun list(): List<Cliente> = clienteRepository.findAll()

    fun deleteByCpf(cpf: String): Unit = clienteRepository.deleteById(cpf)

}