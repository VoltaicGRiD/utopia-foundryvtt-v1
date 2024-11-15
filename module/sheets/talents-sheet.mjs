import { UtopiaItemSheet } from "./item-sheet.mjs";
import Tagify from "../../lib/tagify/tagify.esm.js";

export class UtopiaTalentSheet extends Application {
  displayOptions = {};
  actor = {};
  modifying = "";
  keepOpen = false;

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["utopia", "sheet"],
      width: 600,
      height: 600,
      title: "Talents",
    });
  }

  /** @override */
  get template() {
    return `systems/utopia/templates/talents-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    let options = this.displayOptions;
    let groups = groupByTree(options);
    let keys = Object.keys(groups);

    keys.forEach((k) => {
      groups[k] = sortTree(groups[k]);
    });

    console.log(groups);

    context.trees = groups;

    console.log(context);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    let headers = document.querySelectorAll(".collapsible-header");

    headers.forEach((header) => {
      const chevron = header.querySelector("i");
      header.addEventListener("click", () => {
        const key = header.getAttribute("data-tree-key");
        const content = document.getElementById(`content-${key}`);

        // Toggle the "active" class on the content element
        content.classList.toggle("active");

        // Toggle rotation class on the chevron
        chevron.classList.toggle("rotate-180");
      });
    });

    html.on("click", ".select", this._select.bind(this));
    html.on("click", ".source", this._source.bind(this));
    html.on("click", ".reset", (ev) => {
      html.find('input[name="filter"]')[0].value = '';
      filterItems([], "");
    })
    html.on("click", ".keep-open", (ev) => {
      let checked = ev.currentTarget.checked;
      if (checked) this.keepOpen = true;
      else this.keepOpen = false;
    });

    // html.on("change", ".points", (ev) => {
    //   let type = ev.currentTarget.dataset.type;
    //   let value = ev.currentTarget.value;
    //   filterByPoints(type, value);
    // });

    // Get the filter input element
    let filterInput = html.find('input[name="filter"]')[0];

    // Collect tree names from the DOM to use as the whitelist
    let treeNames = [];
    html.find(".collapsible-header span").each((index, element) => {
      let treeName = $(element).text().trim();
      if (treeName) {
        treeNames.push(treeName);
      }
      if (treeName.includes("-")) {
        let parentTreeName = $(element).text().trim().split("-")[0];
        if (!treeNames.includes(parentTreeName)) {
          treeNames.push(parentTreeName);
        }
      }
    });

    treeNames = treeNames.sort();

    let attributeTags = ["body", "mind", "soul"];

    // Initialize Tagify on the filter input
    let tagify = new Tagify(filterInput, {
      pattern: /@|#/,  // <--  Text starting with @ or # (if single, String can be used here)
      whitelist: treeNames.concat(attributeTags).map((item) => {
        if (typeof item == "string") {
          return { value: item };
        } else {
          return item;
        }
      }),
      mode: "mix", // Enable mixed mode for tags and text
      // Remove the 'pattern' option or adjust it
      enforceWhitelist: false, // Allow both whitelist tags and free-text input
      dropdown: {
        enabled: 1, // Show suggestions after typing one character
        position: "text", // Position dropdown near the typed text
        highlightFirst: true,
      },
    });

    tagify.on("change", onTagifyInput);
    tagify.on("input", onTagifyInput);
    tagify.on("add", onTagifyInput);

    function onTagifyInput(e) {
      let inputValue = tagify.getMixedTagsAsString();
     
      if (inputValue.length > 0) {
        let prefix = e.detail.prefix;

        switch (prefix) {
          case '@': 
            tagify.whitelist = treeNames;
            break;
          case '#': 
            tagify.whitelist = attributeTags;
            break;
        }

        let tags = tagify.value.map((tag) => tag.value); // Extract tag values
        let textFilter = inputValue;

        // Remove tags from the text filter
        tags.forEach((tag) => {
          textFilter = textFilter.replace(tag, "").trim();
        });

        textFilter = textFilter.trim();

        // Apply filtering with the extracted tags and text
        filterItems(tags, textFilter);
      }
      else {
        filterItems([], "");
      }
    }

    function filterByPoints(type, value) {
      console.log(type, value);

      html.find("li.tree").each((index, li) => {
        const $li = $(li);
        let showTree = false;
        
        const rows = $li.find(".sub-tree tr");
        rows.each((i, row) => {
          const $row = $(row);

          let showRow = false;

          switch (type) {
            case 'body': 
              const cell = $row.find('td').eq(2);
              const cellValue = parseInt(cell.text().toLowerCase());
              if (cellValue > value) {
                showRow = true;
              }
              break;
          }

          if (showRow) {
            showTree = true;            
            $row.show();
          } else {
            $row.hide();
          }
        });

        if (showTree) {
          $li.show();
        } else {
          $li.hide();
        }
      });
    }

    function filterItems(tags, textFilter) {
      console.log(tags);
      console.log(textFilter);

      let tagMatches = [];
      
      if (tags.length > 0 || textFilter.length > 0) {
        if (tags.some(t => attributeTags.includes(t))) {
          tagMatches.push(attributeTags)
        }

        // For each tree
        html.find("li.tree").each((index, li) => {
          const $li = $(li);
          const treeName = $li.find(".collapsible-header span").text().trim();

          const wordRegex = /(\w+)/gi;
          let match;
          let treeWords = [];
          while ((match = wordRegex.exec(treeName)) !== null) {
            if (match.index === wordRegex.lastIndex) {
              wordRegex.lastIndex++;
            }
            treeWords.push(match[1].toLowerCase());
          }

          const rows = $li.find(".sub-tree tr");
          let anyVisible = false;

          // Check if the tree's name is in the tags
          if (
            tags.some((t) => treeWords.includes(t.toLowerCase())) ||
            tags.includes(treeName)
          ) {
            // Show the tree and all its items
            $li.show();
            rows.show();
            anyVisible = true;
          } else {
            // Apply filters to this tree
            let showTree = false;
            if (textFilter && treeName.toLowerCase().includes(textFilter)) {
              showTree = true;
            }

            // Filter the items within the tree
            rows.each((i, row) => {
              if (i === 0) return;

              const $row = $(row);
              let showRow = true;

              // Apply text filter to item name
              if (textFilter) {
                const nameCell = $row.find("td").eq(1);
                const nameText = nameCell.text().toLowerCase();
                if (!nameText.includes(textFilter)) {
                  showRow = false;
                }
              }

              // Apply attribute filters
              tagMatches.forEach((tag) => {
                const { attribute, value } = tag;
                let cellIndex;
                switch (attribute) {
                  case "body":
                    cellIndex = 2;
                    break;
                  case "mind":
                    cellIndex = 3;
                    break;
                  case "soul":
                    cellIndex = 4;
                    break;
                  default:
                    cellIndex = null;
                }

                if (cellIndex !== null) {
                  const cell = $row.find("td").eq(cellIndex);
                  const cellText = cell.text().trim();
                  if (cellText !== String(value)) {
                    showRow = false;
                  }
                }
              });

              // Show or hide the row based on the filters
              if (showRow) {
                $row.show();
                anyVisible = true;
              } else {
                $row.hide();
              }
            });

            // Show or hide the entire tree
            if (anyVisible || showTree) {
              $li.show();
            } else {
              $li.hide();
            }
          }
        });
      }
      else {
        // For each tree
        html.find("li.tree").each((index, li) => {
          const $li = $(li);
          $li.show();

          const rows = $li.find(".sub-tree tr");
          rows.each((i, row) => { 
            const $row = $(row);
            $row.show();
          });
        });
      }
    }
  }

  async _source(event) {
    let dataset = event.currentTarget.dataset;
    let option = dataset.option;
    let item = this.displayOptions.find((f) => f._id == option);
    item.sheet.render(true);
  }

  async _select(event) {
    let dataset = event.currentTarget.dataset;
    let option = dataset.option;
    let item = this.displayOptions.find((f) => f._id == option);

    if (this.actor.system.points.talent > 0) {
      let talentPosition = item.system.position;
      let tree = item.system.tree;
      let data = [item];

      if (talentPosition == -1) {
        let created = await Item.createDocuments(data, {
          parent: this.actor,
        });

        let points = this.actor.system.points.talent - 1;
        this.actor.update({
          "system.points.talent": points,
        });
      } else {
        let treePosition = this.actor.system.trees[tree];

        if (treePosition !== undefined) {
          if (talentPosition - 1 === treePosition) {
            let newTree = { [tree]: talentPosition };
            let newTrees = { ...this.actor.system.trees, ...newTree };

            this.actor.update({
              "system.trees": newTrees,
            });

            let created = await Item.createDocuments(data, {
              parent: this.actor,
            });

            let points = this.actor.system.points.talent - 1;
            this.actor.update({
              "system.points.talent": points,
            });
          } else if (talentPosition <= treePosition) {
            ui.notifications.error("You already have that talent.");
            return;
          } else {
            ui.notifications.error(
              `You do not have the prerequisite talent to take this talent from the '${tree}' talent tree.`
            );
            return;
          }
        } else {
          // The actor does not have this talent tree, so initialize it
          // Create a new trees object by copying existing trees and adding the new tree with position 1
          let newTree = { [tree]: 1 };
          let newTrees = { ...this.actor.system.trees, ...newTree };

          console.log(newTrees);

          // Update the actor's talent trees
          this.actor.update({
            "system.trees": newTrees,
          });

          let created = await Item.createDocuments(data, {
            parent: this.actor,
          });

          let points = this.actor.system.points.talent - 1;
          this.actor.update({
            "system.points.talent": points,
          });
        }
      }
    } else {
      ui.notifications.error(
        "This actor does not have enough talent points to add a talent. Duh..."
      );
    }
  }
}

// Function to group objects by 'tree'
function groupByTree(collection) {
  return collection.reduce((acc, obj) => {
    const tree = obj.system.tree; // Access the tree property

    // Initialize array for this tree if it doesn't exist yet
    if (!acc[tree]) {
      acc[tree] = [];
    }

    // Push the current object to the appropriate tree group
    acc[tree].push(obj);

    return acc;
  }, {}); // Start with an empty object as accumulator
}

function sortTree(tree) {
  return tree.sort((a, b) => a.system.position - b.system.position);
}
