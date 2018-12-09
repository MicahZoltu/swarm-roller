"use strict";
class Roller {
    constructor() {
        this.save_required_changed = () => {
            this.save_container_element.hidden = !this.save_required;
        };
        this.roll = () => {
            const attack_rolls = roll_dice(this.swarm_size, 20, this.attack_advantage);
            const number_of_crits = count_success(attack_rolls, 20, 0);
            const number_of_hits = Math.max(count_success(attack_rolls, this.attack_dc, this.attack_modifier), number_of_crits);
            const number_of_non_crits = number_of_hits - number_of_crits;
            const damage_die_count = this.attack_damage.die_count * number_of_hits + this.attack_damage.die_count * number_of_crits;
            const damage = roll_dice(damage_die_count, this.attack_damage.die_size, 'normal').reduce((prev, cur) => prev + cur, 0) + this.attack_damage.modifier * number_of_hits;
            const save_rolls = roll_dice(number_of_hits, 20, this.save_advantage);
            const number_of_saves = count_success(save_rolls, this.save_dc, this.save_modifier);
            const number_of_save_failures = number_of_hits - number_of_saves;
            // this.results_element.innerHTML = `<b>${this.swarm_size}</b> creatures hit <b>${number_of_hits}</b> times and <b>${number_of_crits}</b> of those crit, dealing a total of <b>${damage}</b> damage.  ${this.save_required ? `The target failed <b>${number_of_failures}</b> saves.` : ''}`
            this.results_swarm_size_element.innerText = this.swarm_size.toString();
            this.results_num_hits_element.innerText = number_of_hits.toString();
            this.results_num_crits_element.innerText = number_of_crits.toString();
            this.results_num_non_crits_element.innerText = number_of_non_crits.toString();
            this.results_damage_element.innerText = damage.toString();
            this.results_save_details_element.hidden = !this.save_required;
            this.results_num_save_failures_element.innerText = number_of_save_failures.toString();
            this.results_element.hidden = false;
        };
        document.addEventListener('DOMContentLoaded', () => {
            this.save_required_changed();
            this.save_required_element.onchange = this.save_required_changed;
            this.submit_element.onclick = this.roll;
        });
    }
    get swarm_size_element() { return get_input_element('swarm_size'); }
    get swarm_size() { return Number.parseInt(get_input_element_value(this.swarm_size_element)); }
    get attack_dc_element() { return get_input_element('attack_dc'); }
    get attack_dc() { return Number.parseInt(get_input_element_value(this.attack_dc_element)); }
    get attack_modifier_element() { return get_input_element('attack_modifier'); }
    get attack_modifier() { return Number.parseInt(get_input_element_value(this.attack_modifier_element)); }
    get attack_advantage_element() { return get_select_element('attack_advantage'); }
    get attack_advantage() { return get_select_element_value(this.attack_advantage_element); }
    get attack_damage_element() { return get_input_element('attack_damage'); }
    get attack_damage() { return parse_damage(get_input_element_value(this.attack_damage_element)); }
    get save_required_element() { return get_input_element('save_required'); }
    get save_required() { return this.save_required_element.checked; }
    get save_container_element() { return get_div_element('save_container'); }
    get save_dc_element() { return get_input_element('save_dc'); }
    get save_dc() { return Number.parseInt(get_input_element_value(this.save_dc_element)); }
    get save_modifier_element() { return get_input_element('save_modifier'); }
    get save_modifier() { return Number.parseInt(get_input_element_value(this.save_modifier_element)); }
    get save_advantage_element() { return get_select_element('save_advantage'); }
    get save_advantage() { return get_select_element_value(this.save_advantage_element); }
    get submit_element() { return get_input_element('submit'); }
    /// Results
    get results_element() { return get_div_element('results'); }
    get results_swarm_size_element() { return get_table_data_element('results_swarm_size'); }
    get results_num_hits_element() { return get_table_data_element('results_num_hits'); }
    get results_num_crits_element() { return get_table_data_element('results_num_crits'); }
    get results_num_non_crits_element() { return get_table_data_element('results_num_non_crits'); }
    get results_damage_element() { return get_table_data_element('results_damage'); }
    get results_save_details_element() { return get_table_row_element('results_save_details'); }
    get results_num_save_failures_element() { return get_table_data_element('results_num_save_failures'); }
}
window.roller = new Roller();
///
/// Dice Helpers
///
function random_int(min_inclusive, max_inclusive) {
    min_inclusive = Math.ceil(min_inclusive);
    max_inclusive = Math.floor(max_inclusive);
    return Math.floor(Math.random() * (max_inclusive - min_inclusive + 1)) + min_inclusive;
}
function roll_die(sides, advantage) {
    const first_roll = random_int(1, sides);
    switch (advantage) {
        case 'advantage': return Math.max(first_roll, random_int(1, sides));
        case 'normal': return first_roll;
        case 'disadvantage': return Math.min(first_roll, random_int(1, sides));
    }
}
function roll_dice(count, sides, advantage) {
    const results = [];
    for (let i = 0; i < count; ++i) {
        results.push(roll_die(sides, advantage));
    }
    return results;
}
function count_success(rolls, dc, modifier) {
    let count = 0;
    for (let roll of rolls) {
        if (roll + modifier >= dc)
            ++count;
    }
    return count;
}
function parse_damage(damage) {
    const match = /(\d+)\s*d\s*(\d+)(?:[\s\+]+(\d+))?/.exec(damage);
    if (match === null)
        throw new Error(`invalid damage ${damage}`);
    const die_count = Number.parseInt(match[1]);
    const die_size = Number.parseInt(match[2]);
    const modifier = Number.parseInt(match[3] || '0');
    return { die_count, die_size, modifier };
}
///
/// HTML helpers
///
function get_element(id) {
    const element = document.getElementById(id);
    if (element === null)
        throw new Error(`element with id '${id}' not found`);
    return element;
}
function get_div_element(id) {
    const element = get_element(id);
    if (!(element instanceof HTMLDivElement))
        throw new Error(`element with id '${element.id}' is not an HTMLDivElement`);
    return element;
}
function get_input_element(id) {
    const element = get_element(id);
    if (!(element instanceof HTMLInputElement))
        throw new Error(`element with id '${element.id}' is not an HTMLInputElement`);
    return element;
}
function get_select_element(id) {
    const element = get_element(id);
    if (!(element instanceof HTMLSelectElement))
        throw new Error(`element with id '${element.id} is not an HTMLSelectElement`);
    return element;
}
function get_button_element(id) {
    const element = get_element(id);
    if (!(element instanceof HTMLButtonElement))
        throw new Error(`element with id '${element.id} is not an HTMLButtonElement`);
    return element;
}
function get_table_data_element(id) {
    const element = get_element(id);
    if (!(element instanceof HTMLTableCellElement))
        throw new Error(`element with id '${element.id} is not an HTMLTableCellElement`);
    return element;
}
function get_table_row_element(id) {
    const element = get_element(id);
    if (!(element instanceof HTMLTableRowElement))
        throw new Error(`element with id '${element.id} is not an HTMLTableRowElement`);
    return element;
}
function get_input_element_value(element) {
    const element_value = element.value || element.placeholder;
    if (element_value === null)
        throw new Error(`element with id ${element.id} had no value`);
    return element_value;
}
function get_select_element_value(element) {
    const element_value = element.value;
    if (element_value === null)
        throw new Error(`element with id ${element.id} had no value`);
    return element_value;
}
//# sourceMappingURL=roller.js.map