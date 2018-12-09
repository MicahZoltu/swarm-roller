type Advantage = 'advantage' | 'normal' | 'disadvantage'
interface DamageInfo {
	die_count: number,
	die_size: number,
	modifier: number,
}

class Roller {
	constructor() {
		document.addEventListener('DOMContentLoaded', () => {
			this.save_required_changed()
			this.save_required_element.onchange = this.save_required_changed
			this.submit_element.onclick = this.roll
		})
	}

	public get swarm_size_element(): HTMLInputElement { return get_input_element('swarm_size') }
	public get swarm_size(): number { return Number.parseInt(get_input_element_value(this.swarm_size_element)) }

	public get attack_dc_element(): HTMLInputElement { return get_input_element('attack_dc') }
	public get attack_dc(): number { return Number.parseInt(get_input_element_value(this.attack_dc_element)) }

	public get attack_modifier_element(): HTMLInputElement { return get_input_element('attack_modifier') }
	public get attack_modifier(): number { return Number.parseInt(get_input_element_value(this.attack_modifier_element)) }

	public get attack_advantage_element(): HTMLSelectElement { return get_select_element('attack_advantage') }
	public get attack_advantage(): Advantage { return <Advantage>get_select_element_value(this.attack_advantage_element) }

	public get attack_damage_element(): HTMLInputElement { return get_input_element('attack_damage') }
	public get attack_damage(): DamageInfo { return parse_damage(get_input_element_value(this.attack_damage_element)) }

	public get save_required_element(): HTMLInputElement { return get_input_element('save_required') }
	public get save_required(): boolean { return this.save_required_element.checked }

	public get save_container_element(): HTMLDivElement { return get_div_element('save_container') }

	public get save_dc_element(): HTMLInputElement { return get_input_element('save_dc') }
	public get save_dc(): number { return Number.parseInt(get_input_element_value(this.save_dc_element)) }

	public get save_modifier_element(): HTMLInputElement { return get_input_element('save_modifier') }
	public get save_modifier(): number { return Number.parseInt(get_input_element_value(this.save_modifier_element)) }

	public get save_advantage_element(): HTMLSelectElement { return get_select_element('save_advantage') }
	public get save_advantage(): Advantage { return <Advantage>get_select_element_value(this.save_advantage_element) }

	public get submit_element(): HTMLInputElement { return get_input_element('submit') }

	/// Results
	public get results_element(): HTMLDivElement { return get_div_element('results') }
	public get results_swarm_size_element(): HTMLTableDataCellElement { return get_table_data_element('results_swarm_size') }
	public get results_num_hits_element(): HTMLTableDataCellElement { return get_table_data_element('results_num_hits') }
	public get results_num_crits_element(): HTMLTableDataCellElement { return get_table_data_element('results_num_crits') }
	public get results_num_non_crits_element(): HTMLTableDataCellElement { return get_table_data_element('results_num_non_crits') }
	public get results_damage_element(): HTMLTableDataCellElement { return get_table_data_element('results_damage') }
	public get results_save_details_element(): HTMLTableRowElement { return get_table_row_element('results_save_details') }
	public get results_num_save_failures_element(): HTMLTableDataCellElement { return get_table_data_element('results_num_save_failures') }

	public save_required_changed = () => {
		this.save_container_element.hidden = !this.save_required
	}

	public roll = () => {
		const attack_rolls = roll_dice(this.swarm_size, 20, this.attack_advantage)
		const number_of_crits = count_success(attack_rolls, 20, 0)
		const number_of_hits = Math.max(count_success(attack_rolls, this.attack_dc, this.attack_modifier), number_of_crits)
		const number_of_non_crits = number_of_hits - number_of_crits
		const damage_die_count = this.attack_damage.die_count * number_of_hits + this.attack_damage.die_count * number_of_crits
		const damage = roll_dice(damage_die_count, this.attack_damage.die_size, 'normal').reduce((prev, cur) => prev + cur, 0) + this.attack_damage.modifier * number_of_hits
		const save_rolls = roll_dice(number_of_hits, 20, this.save_advantage)
		const number_of_saves = count_success(save_rolls, this.save_dc, this.save_modifier)
		const number_of_save_failures = number_of_hits - number_of_saves

		// this.results_element.innerHTML = `<b>${this.swarm_size}</b> creatures hit <b>${number_of_hits}</b> times and <b>${number_of_crits}</b> of those crit, dealing a total of <b>${damage}</b> damage.  ${this.save_required ? `The target failed <b>${number_of_failures}</b> saves.` : ''}`
		this.results_swarm_size_element.innerText = this.swarm_size.toString()
		this.results_num_hits_element.innerText = number_of_hits.toString()
		this.results_num_crits_element.innerText = number_of_crits.toString()
		this.results_num_non_crits_element.innerText = number_of_non_crits.toString()
		this.results_damage_element.innerText = damage.toString()
		this.results_save_details_element.hidden = !this.save_required
		this.results_num_save_failures_element.innerText = number_of_save_failures.toString()
		this.results_element.hidden = false
	}
}

(<any>window).roller = new Roller()

///
/// Dice Helpers
///

function random_int(min_inclusive: number, max_inclusive: number): number {
	min_inclusive = Math.ceil(min_inclusive)
	max_inclusive = Math.floor(max_inclusive)
	return Math.floor(Math.random() * (max_inclusive - min_inclusive + 1)) + min_inclusive
}

function roll_die(sides: number, advantage: Advantage): number {
	const first_roll = random_int(1, sides)
	switch (advantage) {
		case 'advantage': return Math.max(first_roll, random_int(1, sides))
		case 'normal': return first_roll
		case 'disadvantage': return Math.min(first_roll, random_int(1, sides))
	}
}

function roll_dice(count: number, sides: number, advantage: Advantage): Array<number> {
	const results = []
	for (let i = 0; i < count; ++i) {
		results.push(roll_die(sides, advantage))
	}
	return results
}

function count_success(rolls: Array<number>, dc: number, modifier: number): number {
	let count = 0
	for (let roll of rolls) {
		if (roll + modifier >= dc) ++count
	}
	return count
}

function parse_damage(damage: string): DamageInfo {
	const match = /(\d+)\s*d\s*(\d+)(?:[\s\+]+(\d+))?/.exec(damage)
	if (match === null) throw new Error(`invalid damage ${damage}`)
	const die_count = Number.parseInt(match[1])
	const die_size = Number.parseInt(match[2])
	const modifier = Number.parseInt(match[3] || '0')
	return { die_count, die_size, modifier }
}

///
/// HTML helpers
///

function get_element(id: string): HTMLElement {
	const element = document.getElementById(id)
	if (element === null) throw new Error(`element with id '${id}' not found`)
	return element
}

function get_div_element(id: string): HTMLDivElement {
	const element = get_element(id)
	if (!(element instanceof HTMLDivElement)) throw new Error(`element with id '${element.id}' is not an HTMLDivElement`)
	return element
}

function get_input_element(id: string): HTMLInputElement {
	const element = get_element(id)
	if (!(element instanceof HTMLInputElement)) throw new Error(`element with id '${element.id}' is not an HTMLInputElement`)
	return element
}

function get_select_element(id: string): HTMLSelectElement {
	const element = get_element(id)
	if (!(element instanceof HTMLSelectElement)) throw new Error(`element with id '${element.id} is not an HTMLSelectElement`)
	return element
}

function get_button_element(id: string): HTMLButtonElement {
	const element = get_element(id)
	if (!(element instanceof HTMLButtonElement)) throw new Error(`element with id '${element.id} is not an HTMLButtonElement`)
	return element
}

function get_table_data_element(id: string): HTMLTableCellElement {
	const element = get_element(id)
	if (!(element instanceof HTMLTableCellElement)) throw new Error(`element with id '${element.id} is not an HTMLTableCellElement`)
	return element
}

function get_table_row_element(id: string): HTMLTableRowElement {
	const element = get_element(id)
	if (!(element instanceof HTMLTableRowElement)) throw new Error(`element with id '${element.id} is not an HTMLTableRowElement`)
	return element
}

function get_input_element_value(element: HTMLInputElement): string {
	const element_value = element.value || element.placeholder
	if (element_value === null) throw new Error(`element with id ${element.id} had no value`)
	return element_value
}

function get_select_element_value(element: HTMLSelectElement): string {
	const element_value = element.value
	if (element_value === null) throw new Error(`element with id ${element.id} had no value`)
	return element_value
}
