import { Expression, exprType, rangeType } from "./expr";
import { Variable, incLocalOffset } from "./main";
import { Type, u64 } from "./type";

export enum stmtType {
    vardeclstmt,
    exprstmt,
    print,
    varAccess,
    block,
    ifStmt,
    whileStmt,
    contineu,
    braek,
    externfn,
    nativefn,
    structdecl,
    enumdecl,
    ret,
    inline_asm,
    module,
    switch,
    intloop,
    defer,
    defer_ph
}

export class Statement {
    expr: Expression;
    type: stmtType;

    // var decl
    initializer?: Expression;
    name: string;
    offset: number;

    // block
    stmts: Statement[];

    //if
    cond: Expression;
    then: Statement;
    else_: Statement | undefined;

    // fn
    params: { name: string, datatype: Type }[] | undefined
    body: Statement


    // var
    datatype: Type;
    is_global: boolean;

    // struct
    defaults: Expression[] | undefined;

    //switch
    prongs: Statement[];
    defers: Statement[];
    cases: Expression[];

    asm_lines: string[]

    variable: Variable;

    vars: Variable[];

    metadata: {
        counter: Variable,
        range_type:rangeType,
        range:Expression,
        ptr: boolean | undefined,
        array_id: Expression | undefined,
        index_var: Variable | undefined
    }[];

    capture:Expression;

    loop_var_assigns: Expression[];

    newDeferPlaceHolder() {
        this.type = stmtType.defer_ph;
        return this;
    }

    newEnum(){
        this.type = stmtType.enumdecl;
        return this;
    }

    newSwitch(cond: Expression, cases: Expression[], prongs: Statement[], else_: Statement) {
        this.cond = cond;
        this.cases = cases;
        this.prongs = prongs;
        this.type = stmtType.switch;
        this.else_ = else_;
        return this;
    }

    newDefer(stmt:Statement) {
        this.type = stmtType.defer;
        this.then = stmt;
        return this;
    }

    newIntLoop(body: Statement, metadata: {
        counter: Variable,
        range_type:rangeType,
        range:Expression,
        ptr: boolean | undefined,
        array_id: Expression | undefined,
        index_var: Variable | undefined
    }[], assigns:Expression[], label:string) {
        this.type = stmtType.intloop;
        this.body = body;
        this.metadata = metadata;
        this.loop_var_assigns = assigns;
        this.name = label;
        return this;
    }

    newVarstatement(initializer: Expression): Statement {
        this.initializer = initializer;
        this.type = stmtType.vardeclstmt;
        return this;
    }

    newStructDeclStatement(): Statement {
        this.type = stmtType.structdecl;
        return this;
    }

    newReturnStatement(expr: Expression): Statement {
        this.expr = expr;
        this.type = stmtType.ret;
        return this;
    }

    newIfStatement(cond: Expression, then: Statement, else_: Statement | undefined, assign:Expression|undefined): Statement {
        this.type = stmtType.ifStmt;
        this.initializer = assign;
        this.then = then;
        this.else_ = else_;
        this.cond = cond;
        return this;
    }

    newWhileStatement(cond: Expression, then: Statement, label:string): Statement {
        this.type = stmtType.whileStmt;
        this.then = then;
        this.cond = cond;
        this.name = label;
        return this;
    }

    newBreakStatement(name = ""): Statement {
        this.name = name;
        this.type = stmtType.braek;
        return this;
    }

    newExternFnStatement(name: string, params: { name: string, datatype: Type }[]): Statement {
        this.name = name;
        this.params = params;
        return this;
    }

    newNativeFnStatement(name: string): Statement {
        this.name = name;
        this.type = stmtType.nativefn;
        return this;
    }

    newContinueStatement(name = ""): Statement {
        this.name = name;
        this.type = stmtType.contineu;
        return this;
    }

    newBlockStatement(stmts: Statement[], defers: Statement[]): Statement {
        this.stmts = stmts;
        this.defers = defers;
        this.type = stmtType.block;
        return this;
    }

    newExprStatement(expr: Expression): Statement {
        this.type = stmtType.exprstmt;
        this.expr = expr;
        return this;
    }

    newAsmStatement(lines: string[]) {
        this.type = stmtType.inline_asm;
        this.asm_lines = lines;
        this.datatype = u64;
        return this;
    }

    newModule(name: string, statements: Statement[]): Statement {
        this.type = stmtType.module;
        this.stmts = statements;
        return this;
    }

    constructor() {
    }

}