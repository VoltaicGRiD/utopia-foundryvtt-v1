const fields = foundry.applications.fields;

const selectInput = fields.createSelectInput({
	options: [
		{
			label: "UTOPIA.Actor.FIELDS.travel.land.label",
			value: "land"
		},
		{
			label: "UTOPIA.Actor.FIELDS.travel.water.label",
			value: "water"
		}
	]
})

const selectGroup = fields.createFormGroup({
	input: selectInput,
	label: "UTOPIA.Macros.FIELDS.select.label",
	hint: "UTOPIA.Macros.FIELDS.select.hint",
	localize: true
})

const content = `${selectGroup.outerHTML}`;

const callback = (event, button, dialog) => {
	const value = dialog.querySelector('select').selectedOptions[0].value;
	const actor = scope.actor;
	
	const effect = ActiveEffect.create({
		name: "Traveller",
		origin: scope.item.uuid,
		type: "passive",
		changes: [
			{
				"key": `system.travel.${value}`,
				"mode": 2,
				"value": 2,
				"priority": null
			}
		]
	})
}

const dialog = await foundry.applications.api.DialogV2.prompt({
	window: { title: game.i18n.localize("UTOPIA.Macros.TITLES.select.label") },
	content: content,
	modal: true,
	ok: {
		label: game.i18n.localize("UTOPIA.Macros.BUTTONS.save.label"),
		icon: "fas fa-floppy-disk",
		callback: (event, button, dialog) => callback(event, button, dialog)
	}
})