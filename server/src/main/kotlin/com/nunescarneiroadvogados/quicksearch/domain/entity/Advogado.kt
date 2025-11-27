package com.nunescarneiroadvogados.quicksearch.domain.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Processo
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "advogado")
data class Advogado(
    @Id
    @Column(name = "codigo_oab", unique = true, nullable = false)
    @field:JsonProperty("codigo_oab")
    var codigoOAB: String = "",
    var nome: String = "",
    var telefone: String = "",
    var email: String = "",

    @JsonIgnore
    @OneToMany(mappedBy = "advogadoResponsavel",
        fetch = FetchType.LAZY,  // MUDE PARA LAZY
        cascade = [CascadeType.ALL], // ADICIONE CASCADE
        orphanRemoval = true)   // ADICIONE ORPHAN REMOVAL
    var processos: MutableList<Processo> = mutableListOf()
)