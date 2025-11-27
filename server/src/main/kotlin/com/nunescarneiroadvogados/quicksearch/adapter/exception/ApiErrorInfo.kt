package com.nunescarneiroadvogados.quicksearch.adapter.exception

import com.fasterxml.jackson.annotation.JsonProperty

data class ApiErrorInfo(
    val status: Int,
    val error: String,
    val message: String,
    val path: String,
    @field:JsonProperty("errors_validation")
    val errorsValidaton: List<String>
)
