const actor = scope.actor;

const resources = actor.system.resources ?? [];
const roll = await new Roll("@mem.total", actor.getRollData()).evaluate();

const newResource = {
	name: "Recollection Charges",
	rollKey: "recollection",
	max: roll.total,
	current: roll.total,
	eval: "@recollection.max - @recollection.current + 1",
	reset: "rest",
	resetEval: "@recollection.max",
	canBeNegative: false,
	visible: true,
}

if (resources.length === 0) 
	return await actor.update({ "system.resources": [newResource] });
else {
	const recollection = resources.find(r => r.rollKey === "recollection");
	if (recollection) 
		return 
	else 
		return await actor.update({ "system.resources": resources.concat(newResource) });
}
