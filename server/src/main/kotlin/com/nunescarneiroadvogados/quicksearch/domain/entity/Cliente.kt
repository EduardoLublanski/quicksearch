package com.nunescarneiroadvogados.quicksearch.domain.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Processo
import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "cliente")
data class Cliente(
    @Id
    var cpf: String = "",
    var nome: String = "",
    var telefone: String = "",
    var email: String = "",
    var cep: String = "",
    var estado: String = "",
    var cidade: String = "",
    var bairro: String = "",
    var rua: String = "",
    var numero: String = "",
    var complemento: String = "",

    @JsonIgnore
    @OneToMany(mappedBy = "cliente",
        fetch = FetchType.LAZY,  // MUDE PARA LAZY
        cascade = [CascadeType.ALL],
        orphanRemoval = true)
    var processos: MutableList<Processo> = mutableListOf()
)


