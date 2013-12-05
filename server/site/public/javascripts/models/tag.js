(function () {
    Deific.Tag = DS.Model.extend({
        __utcdatecreated: DS.attr('date'),

        name: DS.attr('string'),
        excerpt: DS.attr('string'),
        description: DS.attr('string'),
        questioncount: DS.attr('number', { defaultValue: 0 }),

        question: DS.belongsTo('question'),

        selfurl: function () {
            return '/questions/tagged/' + encodeURIComponent(this.get('name'));
        }.property('name'),

        minexcerpt: function () {
            var text = this.get('excerpt');
            var maxLength = 120;
            if (!text) return 'NA';
            if (text.length > maxLength) {
                text = text.substring(0, maxLength);
                text = text.substring(0, Math.min(text.length, text.lastIndexOf(' '))) + '...';
            }
            return text;
        }.property('excerpt'),

        infoUrl: function () {
            return '/tags/' + this.get('name') + '/info';
        }.property('name'),

        editUrl: function () {
            return '/tags/' + this.get('name') + '/edit';
        }.property('name'),

        hoverContent: function () {
            var url = '/tags/' + this.get('name');
            return '<div class="display-block">' + this.get('excerpt') + '</div>' +
                '<div class="display-block mts font95">' +
                    '<a class="mrs pas" href="' + url + '/info">info</a>' +
                    '<a class="mrs pas" href="' + url + '/edit">edit</a>' +
                '</div>';
        }.property('excerpt', 'name'),

        title: function () {
            var self = '/questions/tagged/' + encodeURIComponent(this.get('name'));
            return '<a href="' + self + '">' + this.get('name') + '</a>'
        }.property('name'),


    });
}).call(this);