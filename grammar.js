module.exports = grammar({
  name: "wenyan",

  extras: ($) => [/([ \t\r\n]|。|、)+/, $.comment],

  word: ($) => $.IDENTIFIER,

  rules: {
    program: ($) => repeat($.statement),
    statement: ($) =>
      choice(
        $.declare_statement,
        $.define_statement,
        $.print_statement,
        $.for_statement,
        $.function_statement,
        $.if_statement,
        $.return_statement,
        $.math_statement,
        $.assign_statement,
        $.import_statement,
        $.object_statement,
        $.reference_statement,
        $.array_statement,
        $.flush_statement,
        $.BREAK,
        $.comment
      ),
    reference_statement: ($) =>
      seq(
        "夫",
        $.data,
        optional(
          seq(
            "之",
            choice($.STRING_LITERAL, $.INT_NUM, "其餘", $.IDENTIFIER, "長")
          )
        ),
        optional($.name_single_statement)
      ),
    array_statement: ($) =>
      choice($.array_cat_statement, $.array_push_statement),
    array_cat_statement: ($) =>
      seq(
        "銜",
        choice($.IDENTIFIER, "其"),
        repeat1(seq($.PREPOSITION_RIGHT, $.IDENTIFIER)),
        optional($.name_single_statement)
      ),
    array_push_statement: ($) =>
      seq(
        "充",
        choice($.IDENTIFIER, "其"),
        repeat1(seq($.PREPOSITION_RIGHT, $.data)),
        optional($.name_single_statement)
      ),
    function_statement: ($) =>
      choice(
        $.function_define_statement,
        seq($.function_call_statement, optional($.name_single_statement))
      ),
    function_call_statement: ($) =>
      choice($.function_pre_call, $.function_post_call),
    function_pre_call: ($) =>
      choice(
        seq("施", $.IDENTIFIER, repeat(seq($.preposition, $.data))),
        seq("施其", repeat(seq($.preposition, $.data)))
      ),
    function_post_call: ($) =>
      prec.left(repeat1(seq("取", $.INT_NUM, "以施", $.IDENTIFIER))),
    function_define_statement: ($) =>
      seq(
        "吾有",
        $.INT_NUM,
        "術",
        $.name_single_statement,
        optional(
          seq(
            "欲行是術",
            "必先得",
            repeat1(seq($.INT_NUM, $.TYPE, repeat1(seq("曰", $.IDENTIFIER))))
          )
        ),
        choice("是術曰", "乃行是術曰"),
        repeat($.statement),
        "是謂",
        $.IDENTIFIER,
        "之術也"
      ),
    if_statement: ($) =>
      seq(
        $.IF,
        $.if_expression,
        "者",
        repeat1($.statement),
        optional(seq($.ELSE, repeat1($.statement))),
        $.FOR_IF_END
      ),
    if_expression: ($) => choice($.unary_if_expression, $.binary_if_expression),
    unary_if_expression: ($) =>
      choice(
        $.data,
        seq($.IDENTIFIER, "之", choice("長", $.STRING_LITERAL, $.IDENTIFIER)),
        "其"
      ),
    binary_if_expression: ($) =>
      seq($.unary_if_expression, $.IF_LOGIC_OP, $.unary_if_expression),
    declare_statement: ($) =>
      seq(choice("吾有", "今有"), $.INT_NUM, $.TYPE, repeat(seq("曰", $.data))),
    define_statement: ($) =>
      choice(
        seq($.declare_statement, $.name_multi_statement),
        $.init_define_statement
      ),
    name_multi_statement: ($) => seq("名之", repeat1(seq("曰", $.IDENTIFIER))),
    name_single_statement: ($) => seq("名之", seq("曰", $.IDENTIFIER)),
    init_define_statement: ($) =>
      seq("有", $.TYPE, $.data, optional($.name_single_statement)),
    for_statement: ($) =>
      choice($.for_arr_statement, $.for_enum_statement, $.for_while_statement),
    for_arr_statement: ($) =>
      seq(
        $.FOR_START_ARR,
        $.IDENTIFIER,
        $.FOR_MID_ARR,
        $.IDENTIFIER,
        repeat($.statement),
        $.FOR_IF_END
      ),
    for_enum_statement: ($) =>
      seq(
        $.FOR_START_ENUM,
        choice($.INT_NUM, $.IDENTIFIER),
        $.FOR_MID_ENUM,
        repeat($.statement),
        $.FOR_IF_END
      ),
    for_while_statement: ($) =>
      seq($.FOR_START_WHILE, repeat($.statement), $.FOR_IF_END),
    math_statement: ($) =>
      seq(
        choice(
          $.arith_math_statement,
          $.boolean_algebra_statement,
          $.mod_math_statement
        ),
        optional($.name_multi_statement)
      ),
    arith_math_statement: ($) =>
      choice($.arith_binary_math, $.arith_unary_math),
    arith_binary_math: ($) =>
      seq(
        $.ARITH_BINARY_OP,
        choice($.data, "其"),
        $.preposition,
        choice($.data, "其")
      ),
    arith_unary_math: ($) => seq($.UNARY_OP, choice($.IDENTIFIER, "其")),
    mod_math_statement: ($) =>
      seq(
        "除",
        choice($.INT_NUM, $.FLOAT_NUM, $.IDENTIFIER, "其"),
        $.preposition,
        choice($.INT_NUM, $.FLOAT_NUM, $.IDENTIFIER),
        optional($.POST_MOD_MATH_OP)
      ),
    boolean_algebra_statement: ($) =>
      seq("夫", $.IDENTIFIER, $.IDENTIFIER, $.LOGIC_BINARY_OP),
    assign_statement: ($) =>
      seq(
        "昔之",
        $.IDENTIFIER,
        optional(seq("之", choice($.INT_NUM, $.STRING_LITERAL, $.IDENTIFIER))),
        "者",
        choice(
          seq(
            "今",
            choice(seq($.data, optional(seq("之", $.INT_NUM))), "其"),
            "是矣"
          ),
          "今不復存矣"
        )
      ),
    return_statement: ($) =>
      seq("乃得", choice(choice($.data, "其"), "乃歸空無", "乃得矣")),
    import_statement: ($) =>
      seq(
        "吾嘗觀",
        $.STRING_LITERAL,
        "之書",
        optional(seq("方悟", repeat1($.IDENTIFIER), "之義"))
      ),
    object_statement: ($) =>
      seq(
        "吾有",
        $.INT_NUM,
        "物",
        $.name_multi_statement,
        optional($.object_define_statement)
      ),
    object_define_statement: ($) =>
      seq(
        "其物如是",
        repeat1(seq("物之", $.STRING_LITERAL, "者", $.TYPE, "曰", $.data)),
        "是謂",
        $.IDENTIFIER,
        "之物也"
      ),
    data: ($) =>
      choice(
        $.STRING_LITERAL,
        $.BOOL_VALUE,
        $.IDENTIFIER,
        $.INT_NUM,
        $.FLOAT_NUM
      ),
    STRING_LITERAL: ($) => /「「[^」]*」」/,
    IDENTIFIER: ($) => /「[^」]+」/,
    ARITH_BINARY_OP: ($) => choice("加", "減", "乘"),
    LOGIC_BINARY_OP: ($) => choice("中有陽乎", "中無陰乎"),
    POST_MOD_MATH_OP: ($) => "所餘幾何",
    UNARY_OP: ($) => "變",
    preposition: ($) => choice($.PREPOSITION_LEFT, $.PREPOSITION_RIGHT),
    PREPOSITION_LEFT: ($) => "於",
    PREPOSITION_RIGHT: ($) => "以",
    IF: ($) => "若",
    ELSE: ($) => "若非",
    IF_LOGIC_OP: ($) =>
      choice("等於", "不等於", "不大於", "不小於", "大於", "小於"),
    FOR_START_ARR: ($) => "凡",
    FOR_START_ENUM: ($) => "為是",
    FOR_START_WHILE: ($) => "恆為是",
    FOR_MID_ARR: ($) => "中之",
    FOR_MID_ENUM: ($) => "遍",
    FOR_IF_END: ($) => choice("云云", "也"),
    FLOAT_NUM: ($) =>
      seq($.INT_NUM, "又", repeat1(seq($.INT_NUM, $.FLOAT_NUM_KEYWORDS))),
    FLOAT_NUM_KEYWORDS: ($) =>
      choice("分", "釐", "毫", "絲", "忽", "微", "塵", "埃", "渺", "漠"),
    INT_NUM: ($) => repeat1($.INT_NUM_KEYWORDS),
    INT_NUM_KEYWORDS: ($) =>
      choice(
        "零",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
        "七",
        "八",
        "九",
        "十",
        "百",
        "千",
        "萬",
        "億",
        "兆",
        "京",
        "垓",
        "秭",
        "穣",
        "溝",
        "澗",
        "正",
        "載",
        "極"
      ),
    TYPE: ($) => choice("數", "列", "言", "爻"),
    BOOL_VALUE: ($) => choice("陰", "陽"),
    print_statement: ($) => "書之",
    comment: ($) => seq(choice("注曰", "疏曰", "批曰"), $.STRING_LITERAL),
    flush_statement: ($) => "噫",
    BREAK: ($) => "乃止",
  },
});
