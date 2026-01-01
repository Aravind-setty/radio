"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStreamDto = void 0;
const class_validator_1 = require("class-validator");
var StreamType;
(function (StreamType) {
    StreamType["EXTERNAL"] = "EXTERNAL";
    StreamType["BROWSER"] = "BROWSER";
})(StreamType || (StreamType = {}));
class CreateStreamDto {
    title;
    genre;
    description;
    type;
}
exports.CreateStreamDto = CreateStreamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3, { message: 'Title must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Title must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateStreamDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Genre must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateStreamDto.prototype, "genre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Description must not exceed 500 characters' }),
    __metadata("design:type", String)
], CreateStreamDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(StreamType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStreamDto.prototype, "type", void 0);
//# sourceMappingURL=create-stream.dto.js.map