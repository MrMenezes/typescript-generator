import { AstRoot, astToJson } from "@sdkgen/parser";
import { generateTypescriptEnum, generateTypescriptErrorClass, generateTypescriptInterface, generateTypescriptTypeName } from "./helpers";

interface Options {
}

export function generateNodeServerSource(ast: AstRoot, options: Options) {
    let code = "";

    code += `import { Context, SdkgenHttpServer, BaseApiConfig } from "@sdkgen/node-runtime";

`;

    for (const type of ast.enumTypes) {
        code += generateTypescriptEnum(type);
    }
    code += "\n";

    for (const type of ast.structTypes) {
        code += generateTypescriptInterface(type);
        code += "\n";
    }

    for (const error of ast.errors) {
        code += generateTypescriptErrorClass(error);
        code += "\n";
    }

    code += `class ApiConfig extends BaseApiConfig {
    fn: {${
        ast.operations.map(op => `
        ${op.prettyName}?: (ctx: Context, args: {${op.args.map(arg =>
            `${arg.name}: ${generateTypescriptTypeName(arg.type)}`
        ).join(", ")}}) => Promise<${generateTypescriptTypeName(op.returnType)}>`).join("")}
    } = {}

    err = {${ast.errors.map(err => `
        ${err}: (message: string = "") => { throw new ${err}(message); }`).join(",")}
    }

    astJson = ${JSON.stringify(astToJson(ast), null, 4).replace(/"(\w+)":/g, '$1:').replace(/\n/g, "\n    ")}
}

export const api = new ApiConfig();
`;

    return code;
}
