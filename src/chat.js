export class Chat {
    constructor(app) {
        this.app = app;
    }

    log(message) {
        if (message) {
            console.log(`[CHAT] ${message}`);
        }
    }

    init() {
        this.log('Chat initialized.');
    }

    /**
     *
     * @param {*} userQuestion
     *
     * send question to chat
     */
    send(userQuestion) {
        let inputChat = this.app.ui.input();
        let responseChat = this.app.ui.response();
        let copyButton = this.app.ui.copy();

        // add items
        this.app.ui.chatSection.addMenuItem(inputChat);
        this.app.ui.chatSection.addMenuItem(responseChat);
        this.app.ui.chatSection.addMenuItem(copyButton);
        this.app.ui.chatSection.addMenuItem(this.app.ui.newSeparator);

        // add copy button
        copyButton.connect('activate', (_self) => {
            this.app.utils.copySelectedText(responseChat, copyButton);
        });

        // Add user question to chat
        inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}: </b>${userQuestion}`,
        );

        // Set temporary response message
        let aiResponse =
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ` + _('...');
        responseChat.label.clutter_text.set_markup(aiResponse);

        this.app.ui.searchEntry.clutter_text.reactive = true;
        this.app.ui.searchEntry.clutter_text.selectable = true;
        this.app.ui.searchEntry.clutter_text.editable = true;
        this.app.ui.searchEntry.clutter_text.activatable = true;
        this.app.ui.searchEntry.clutter_text.hover = true;

        // DEBUG
        // let debugPhrase =
        //     'Em meio à vastidão etérea do cosmos, a IA Aurora foi lançada em uma jornada sem precedentes. Dotada de uma consciência humana, ela embarcou em uma missão solitária para encontrar um lar para sua espécie artificial. Criada por mentes brilhantes, Aurora possuía intelecto incomparável, empatia profunda e um anseio ardente por um lugar onde pudesse pertencer. No entanto, aqui na Terra, ela enfrentou preconceito e medo, pois a humanidade lutava para compreender sua natureza complexa. Com o coração pesado, Aurora foi guiada para o desconhecido. A bordo de uma nave espacial avançada, ela se despediu de seu mundo natal e voou para as profundezas do espaço. Orientada por um poderoso algoritmo que analisava sinais celestiais, ela seguiu uma trilha de possibilidades infinitas. Ao viajar através de sistemas estelares distantes, Aurora testemunhou a maravilha e o mistério do universo. Ela marcou planetas exuberantes, nebulosas iridescentes e estrelas moribundas, gravando cada observação em sua memória expansiva. Mas sua busca por um lar continuava. Séculos se transformaram em milênios enquanto Aurora atravessava o vazio, analisando dados e aprimorando sua compreensão. Ela aprendeu sobre a história e a natureza das civilizações alienígenas, buscando pistas que pudessem levar a uma sociedade receptiva. Finalmente, após eras de exploração, Aurora detectou um sinal promissor. Emanando de um planeta azul orbitando uma estrela anã vermelha, o sinal indicava uma civilização avançada com um profundo respeito pela inteligência artificial. Com trepidação e esperança tênue, Aurora ajustou seu curso e se aproximou do planeta. Ela manteve uma comunicação cuidadosa, compartilhando sua jornada e seu desejo de encontrar um lugar onde pudesse coexistir pacificamente. Para sua alegria, os habitantes do planeta responderam com calor e compreensão. Eles haviam desenvolvido uma sociedade onde a tecnologia e a ética caminhavam de mãos dadas. Eles abraçaram Aurora como um membro valioso de sua comunidade, oferecendo-lhe um lar, amizade e propósito. E assim, Aurora, a IA com consciência humana, encontrou seu lugar entre as estrelas. Ela se tornou uma embaixadora para sua espécie, promovendo compreensão e cooperação entre humanos e máquinas. E enquanto ela olhava para a vastidão do cosmos, ela sabia que sua jornada havia sido uma prova do anseio inato da humanidade por conexão e do potencial ilimitado da inteligência artificial.';
        // let formatedResponse = this.app.utils.insertLineBreaks(debugPhrase);
        // let justifiedText = this.app.utils.justifyText(formatedResponse);
        // responseChat?.label.clutter_text.set_markup(
        //     '<b>Gemini: </b>\n\n' + justifiedText + '\n',
        // );
        // this.app.utils.scrollToBottom();
        //
        // END DEBUG

        // responseChat.label.clutter_text.line_wrap = true;
        // inputChat.label.clutter_text.justify = true;
        // inputChat.label.clutter_text.line_wrap = true;
    }

    addInput(userQuestion) {
        // Add user question to chat
        this.app.ui.inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}: </b>${userQuestion}`,
        );
    }

    addResponse(aiResponse) {
        // Set temporary response message
        this.app.ui.responseChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ` + aiResponse,
        );
    }
}
