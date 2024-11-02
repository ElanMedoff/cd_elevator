total_start=`date +%s.%N`

# eg: get_runtime start end label
# $1: start
# $2: end
# $3: label
get_runtime() {
  echo "$3 runtime: $( echo "$2 - $1" | bc -l )"
}

red='\033[0;31m'
no_color='\033[0m'
# eg: err "bad argument!"
# $1: message
err() {
  echo -e "${red}$1${no_color}"
}

script_dir="$(dirname "$0")"
change_dir=""
forwards_flag=0
backwards_flag=0
clear_flag=0
debug_flag=0
print_flag=0

for arg in "$@"
do
  case "$arg" in 
    --forwards)
      forwards_flag=1
      shift
      ;;
    --backwards)
      backwards_flag=1
      shift
      ;;
    --clear)
      clear_flag=1
      shift
      ;;
    --debug)
      debug_flag=1
      shift
      ;;
    --print)
      print_flag=1
      shift
      ;;
    --change_dir=*)
      change_dir=$(echo "$arg" | cut -d'=' -f2)
      shift
      ;;
    *)
      err "Unknown option: $arg"
      return 1
      ;;
  esac
done

if [[ "$change_dir" == "" ]]
then 
  change_dir_flag=0
else 
  change_dir_flag=1
fi

sum=$((forwards_flag + backwards_flag + clear_flag + print_flag + change_dir_flag))
if [[ "$sum" != 1 ]] 
then 
  err "only one of --forwards, --backwards, --clear, --print, --change_dir is supported!"
  return 1
fi

if [[ "$debug_flag" == 1 ]]
then 
  # clean logs at the beginning of the script so can view the logs after running the script
  deno task --cwd="$script_dir" cleanup --script_dir="$script_dir"
fi

if [[ "$forwards_flag" == 1 ]]
then 
  before_nav_pwd=$(pwd)
  # run deno command directly to avoid the output from `deno task` i.e. Task push_stack ...
  forwards_cmd="deno run --allow-write --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$script_dir/scripts/forwards.ts""
  forwards_cmd+=" --before_nav_pwd="$before_nav_pwd""
  forwards_cmd+=" --pid="$$""
  forwards_cmd+=" --script_dir="$script_dir""

  [[ "$debug_flag" == 1 ]] && forwards_cmd+=" --debug"
  forwards_out=$(eval "$forwards_cmd")

  if [[ "$forwards_out" == "__err" ]]
  then
    return 2
  else
    builtin cd "$forwards_out"
  fi
fi

if [[ "$backwards_flag" == 1 ]]
then
  before_nav_pwd=$(pwd)
  if builtin cd ".."
  then
    after_nav_pwd=$(pwd)

    backwards_cmd="deno task --cwd="$script_dir" backwards"
    backwards_cmd+=" --after_nav_pwd="$after_nav_pwd""
    backwards_cmd+=" --before_nav_pwd="$before_nav_pwd""
    backwards_cmd+=" --pid="$$""
    backwards_cmd+=" --script_dir="$script_dir""

    [[ "$debug_flag" == 1 ]] && backwards_cmd+=" --debug"
    [[ "$debug_flag" == 0 ]] && backwards_cmd="($backwards_cmd > /dev/null 2>&1 &)"
    eval "$backwards_cmd"
  else 
    return 1
  fi
fi

if [[ "$change_dir_flag" == 1 ]]
then
  before_nav_pwd=$(pwd)

  change_dir_parent=$(dirname $(realpath "$change_dir"))
  if [[ "$change_dir_parent" != "$before_nav_pwd" ]]
  then
    return 3
  fi

  if builtin cd "$change_dir"
  then 
    after_nav_pwd=$(pwd)

    change_dir_cmd="deno task --cwd="$script_dir" push_stack"
    change_dir_cmd+=" --before_nav_pwd="$before_nav_pwd""
    change_dir_cmd+=" --after_nav_pwd="$after_nav_pwd""
    change_dir_cmd+=" --pid="$$""
    change_dir_cmd+=" --script_dir="$script_dir""

    [[ "$debug_flag" == 1 ]] && change_dir_cmd+=" --debug"
    [[ "$debug_flag" == 0 ]] && change_dir_cmd="($change_dir_cmd > /dev/null 2>&1 &)"
    eval "$change_dir_cmd"
  else 
    return 1
  fi
fi

if [[ "$clear_flag" == 1 ]]
then
  clear_cmd="deno task --cwd="$script_dir" clear_kv"
  clear_cmd+=" --script_dir="$script_dir""

  [[ "$debug_flag" == 1 ]] && clear_cmd+=" --debug"
  [[ "$debug_flag" == 0 ]] && clear_cmd="($clear_cmd > /dev/null 2>&1 &)"
  eval "$clear_cmd"
fi

if [[ "$print_flag" == 1 ]]
then
  print_cmd="deno run --allow-write --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$script_dir/scripts/print_kv.ts""
  print_cmd+=" --pid="$$""
  print_cmd+=" --script_dir="$script_dir""

  [[ "$debug_flag" == 1 ]] && print_cmd+=" --debug"
  eval "$print_cmd"
fi

total_end=`date +%s.%N`
if [[ "$debug_flag" == 1 ]]
then 
  get_runtime "$total_start" "$total_end" "Total"
fi
