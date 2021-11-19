# examples/hooks

### TODO: Example hooks

These are example task hooks. Move one into your tasks folder & rename it to install one.

Hooks must be named: before, before-all, after or after-all. They can use any extension but must be executable.

You can also inline these inside the task config:
```json
// your_task_rc.json
{
  "name": "your tasks name",
  "url": "https://example.com",
  "hooks": {
    "before": "my shell command",
    "before-all": "This will run before all tasks",
    "after": "This will run after the checksum",
    "after-all": "This will run after all tasks"
  }
}
```

## Arguments passed to hooks
```bash
# @param {boolean}  (1)      - had update     
# @param {string[]} (1 - x)  - any new files

echo "$1"     # true
echo "${@:2}" # updated_file.ext updated_file1.ext
```

JavaScript:
```js
const [hadUpdate, ...files] = process.argv.slice(2)

console.log(hadUpdate) // 'true'
console.log(files)     // ['updated_file.ext', 'updated_file1.ext']
```

Python:
```python
import sys

sys.argv.pop(0)
had_update, *files = sys.argv

print(had_update) # 'true'
print(files)      # ['updated_file.ext', 'updated_file1.ext']
```
