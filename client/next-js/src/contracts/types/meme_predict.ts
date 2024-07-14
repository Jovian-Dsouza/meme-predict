/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/meme_predict.json`.
 */
export type MemePredict = {
  "address": "GY8BPUoP7LvyEwGijUqN5tyWmY9zn894x9AHQKzaYocp",
  "metadata": {
    "name": "memePredict",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimReward",
      "discriminator": [
        149,
        95,
        181,
        242,
        94,
        90,
        158,
        162
      ],
      "accounts": [
        {
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createMarket",
      "discriminator": [
        103,
        226,
        97,
        235,
        200,
        188,
        251,
        254
      ],
      "accounts": [
        {
          "name": "counter",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "counter.count",
                "account": "counter"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "coin",
          "type": "pubkey"
        },
        {
          "name": "currentPrice",
          "type": "u64"
        },
        {
          "name": "fixedVotingAmount",
          "type": "u64"
        },
        {
          "name": "votingTime",
          "type": "i64"
        },
        {
          "name": "settlementTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "counter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "makePrediction",
      "discriminator": [
        206,
        137,
        238,
        92,
        59,
        16,
        13,
        227
      ],
      "accounts": [
        {
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              },
              {
                "kind": "account",
                "path": "predictor"
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "predictor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "bool"
        }
      ]
    },
    {
      "name": "settleMarket",
      "discriminator": [
        193,
        153,
        95,
        216,
        166,
        6,
        144,
        217
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u64"
        },
        {
          "name": "finalPrice",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "counter",
      "discriminator": [
        255,
        176,
        4,
        245,
        188,
        253,
        124,
        25
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "prediction",
      "discriminator": [
        98,
        127,
        141,
        187,
        218,
        33,
        8,
        14
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidVotingTime",
      "msg": "Voting time must be in the future"
    },
    {
      "code": 6001,
      "name": "invalidSettlementTime",
      "msg": "Settlement time must be in the future"
    },
    {
      "code": 6002,
      "name": "invalidTimes",
      "msg": "Voting time must be less than settlement time"
    },
    {
      "code": 6003,
      "name": "votingTimeExpired",
      "msg": "Voting time must be less than current time when making prediction"
    },
    {
      "code": 6004,
      "name": "alreadyVoted",
      "msg": "User already voted once"
    },
    {
      "code": 6005,
      "name": "alreadyClaimed",
      "msg": "User already claimed once"
    },
    {
      "code": 6006,
      "name": "alreadySettled",
      "msg": "Market already settled"
    },
    {
      "code": 6007,
      "name": "marketNotSettled",
      "msg": "Settlement time has not been completed"
    }
  ],
  "types": [
    {
      "name": "counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "coin",
            "type": "pubkey"
          },
          {
            "name": "votingTime",
            "type": "i64"
          },
          {
            "name": "settlementTime",
            "type": "i64"
          },
          {
            "name": "initialPrice",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "result",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "totalUpBets",
            "type": "u64"
          },
          {
            "name": "totalDownBets",
            "type": "u64"
          },
          {
            "name": "fixedVotingAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "prediction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "prediction",
            "type": "bool"
          },
          {
            "name": "done",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
