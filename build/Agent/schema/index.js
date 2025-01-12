"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstagramCommentSchema = void 0;
const generative_ai_1 = require("@google/generative-ai");
const getInstagramCommentSchema = () => {
    return {
        description: `Lists comments that are engaging and have the potential to attract more likes and go viral.`,
        type: generative_ai_1.SchemaType.ARRAY,
        items: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                comment: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "A comment between 150 and 250 characters.",
                    nullable: false,
                },
                viralRate: {
                    type: generative_ai_1.SchemaType.NUMBER,
                    description: "The viral rate, measured on a scale of 0 to 100.",
                    nullable: false,
                },
                commentTokenCount: {
                    type: generative_ai_1.SchemaType.NUMBER,
                    description: "The total number of tokens in the comment.",
                    nullable: false,
                },
            },
            required: [
                "comment",
                "viralRate",
                "commentTokenCount"
            ],
        },
    };
};
exports.getInstagramCommentSchema = getInstagramCommentSchema;
