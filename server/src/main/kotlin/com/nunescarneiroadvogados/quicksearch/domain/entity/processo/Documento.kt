package com.nunescarneiroadvogados.quicksearch.domain.entity.processo

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "documento")
data class Documento(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    var descricao: String = "",

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "processo_id")
    var processo: Processo? = null,
)
