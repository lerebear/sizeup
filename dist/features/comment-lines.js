"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_1 = require("../feature");
const registry_1 = require("../registry");
class Comments extends feature_1.default {
    evaluate() {
        return this.changeset.files.reduce((sum, file) => sum + this.countComments(file), 0);
    }
    countComments(file) {
        if (!file.language) {
            return 0;
        }
        let sum = 0;
        for (const chunk of file.chunks) {
            let blockComments = 0;
            for (const change of chunk.changes) {
                if (["del", "normal"].includes(change.type)) {
                    continue;
                }
                const line = change.content.substring(1).trimStart();
                if (line.startsWith(file.language.lineCommentStyle.start)) {
                    sum++;
                    blockComments = 0;
                }
                else if (file.language.blockCommentStyle && line.startsWith(file.language.blockCommentStyle.start) && line.endsWith(file.language.blockCommentStyle.end)) {
                    sum++;
                    blockComments = 0;
                }
                else if (file.language.blockCommentStyle && line.startsWith(file.language.blockCommentStyle.start)) {
                    blockComments++;
                }
                else if (file.language.blockCommentStyle && blockComments > 0 && line.startsWith(file.language.blockCommentStyle.end)) {
                    // We must check for block comment end _before_ we check for block comment continuation,
                    // because the block comment continuation is frequently a substring of the block comment
                    // end (e.g. in languages with C-style comments, "*" is a substring of "*/")
                    blockComments++;
                    sum += blockComments;
                    blockComments = 0;
                }
                else if (file.language.blockCommentStyle && blockComments > 0 && line.startsWith(file.language.blockCommentStyle.continuation)) {
                    blockComments++;
                }
                else {
                    blockComments = 0;
                }
            }
        }
        return sum;
    }
}
exports.default = Comments;
registry_1.FeatureRegistry.set(Comments.variableName(), Comments);
